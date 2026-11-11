"""Douyin official API collector. Never persist/log raw API responses or credentials."""
import hashlib
import json
import os
from pathlib import Path
import sys
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

OUTPUT = Path(__file__).resolve().parents[1] / 'data/platforms.json'
API = 'https://open.douyin.com'

class CollectionError(Exception):
    pass


def request(path, params, token=None):
    # Fixed official host only; no configurable URLs, no redirects with secrets.
    from urllib.request import HTTPRedirectHandler, build_opener
    class NoRedirect(HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            raise CollectionError('API_REDIRECT')
    headers = {'Accept': 'application/json'}
    if token:
        headers['access-token'] = token
    req = Request(API + path + '?' + urlencode(params), headers=headers)
    with build_opener(NoRedirect).open(req, timeout=30) as response:
        body = response.read(8_000_001)
    if len(body) > 8_000_000:
        raise CollectionError('RESPONSE_TOO_LARGE')
    result = json.loads(body)
    data = result.get('data')
    if not isinstance(data, dict) or data.get('error_code') != 0:
        raise CollectionError('API_REJECTED')
    return data


def counter(value):
    if type(value) is not int or value < 0 or value > 2**53-1:
        raise CollectionError('INVALID_METRIC')
    return value


def project(item):
    """Only explicitly approved public videos; no title, URL, account or analytics."""
    if item.get('is_reviewed') is not True or item.get('is_private') is True:
        return None
    stats = item.get('statistics', {})
    date = datetime.fromtimestamp(item['create_time'], timezone.utc).astimezone(
        __import__('zoneinfo').ZoneInfo('Asia/Shanghai')).date().isoformat()
    return {'id': hashlib.sha256(item['item_id'].encode()).hexdigest(), 'date': date,
            'likes': counter(stats['digg_count']), 'comments': counter(stats['comment_count'])}


def collect(fetch, env):
    required = ['DOUYIN_CLIENT_KEY', 'DOUYIN_OPEN_ID', 'DOUYIN_REFRESH_TOKEN', 'DOUYIN_PUBLIC_ITEM_IDS']
    if env.get('DOUYIN_PUBLICATION_APPROVED') != 'true' or any(not env.get(k) for k in required):
        return None
    approved = json.loads(env['DOUYIN_PUBLIC_ITEM_IDS'])
    if not isinstance(approved, list):
        raise CollectionError('INVALID_ALLOWLIST')
    allowed = set(approved)
    if not allowed or any(not isinstance(x, str) or not x for x in allowed):
        raise CollectionError('INVALID_ALLOWLIST')
    auth = fetch('/oauth/refresh_token/', {'client_key': env['DOUYIN_CLIENT_KEY'],
                 'grant_type': 'refresh_token', 'refresh_token': env['DOUYIN_REFRESH_TOKEN']})
    token = auth['access_token']
    # No mutation of repository secrets. Require renewed operator authorization on expiry/rotation.
    if auth.get('open_id') != env['DOUYIN_OPEN_ID']:
        raise CollectionError('ACCOUNT_MISMATCH')
    if auth.get('refresh_token', env['DOUYIN_REFRESH_TOKEN']) != env['DOUYIN_REFRESH_TOKEN']:
        raise CollectionError('REFRESH_TOKEN_ROTATED')
    works = {}
    cursor = 0
    seen = set()
    for _ in range(100):
        page = fetch('/api/douyin/v1/video/video_list/', {'open_id': env['DOUYIN_OPEN_ID'],
                     'cursor': cursor, 'count': 20}, token)
        if not isinstance(page.get('list'), list):
            raise CollectionError('INVALID_PAGE')
        for item in page['list']:
            if item.get('item_id') in allowed:
                row = project(item)
                if row:
                    works[row['id']] = row
        if not page.get('has_more'):
            return sorted(works.values(), key=lambda r: (r['date'], r['id']))
        cursor = page['cursor']
        if type(cursor) is not int or cursor in seen:
            raise CollectionError('INVALID_CURSOR')
        seen.add(cursor)
    raise CollectionError('PAGE_LIMIT')


def run(fetch=request, env=None, output=OUTPUT):
    env = os.environ if env is None else env
    document = json.loads(output.read_text())
    platform = document['platforms']['douyin']
    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    platform['lastAttemptAt'] = now
    exit_code = 0
    try:
        works = collect(fetch, env)
        if works is None:
            # Revoking publication configuration also removes previously published metrics.
            platform.update(state='not_configured', works=[], lastSuccessAt=None,
                            message='尚未配置官方授权、公开作品许可或发布审批。')
        else:
            platform.update(state='ok', works=works, lastSuccessAt=now,
                            message='仅含经确认可公开的作品点赞与评论累计数；不含私密分析。')
    except Exception:
        # Fixed public message: exceptions may contain token URLs and private response data.
        platform.update(state='error', message='官方采集失败：请在私有设置检查授权有效期、作品权限、接口版本和网络；保留上次成功快照。')
        exit_code = 1
    temporary = output.with_suffix('.tmp')
    temporary.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(output)
    return exit_code


if __name__ == '__main__':
    sys.exit(run())
