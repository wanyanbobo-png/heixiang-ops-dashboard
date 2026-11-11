"""Run against a local server. Fixtures are routed in memory, never written to Pages."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE='http://127.0.0.1:8000'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE,wait_until='networkidle')
    assert '待授权' in page.locator('#collectionStatus').inner_text()
    assert not page.locator('#cloudLogin').count()
    for view in ['overview','content','platform','weekly','conversion','manage']:
        page.locator('[data-view="'+view+'"]').click()
        assert page.locator('#view-'+view).is_visible()
    page.locator('#fileInput').set_input_files('作品明细模板.csv')
    page.wait_for_function("JSON.parse(localStorage.getItem('blackbox-dashboard-v1')||'null')?.demo === false")
    data=page.evaluate("JSON.parse(localStorage.getItem('blackbox-dashboard-v1'))")
    assert data['content'] and data['importEvents']
    page.reload(wait_until='networkidle')
    assert data==page.evaluate("JSON.parse(localStorage.getItem('blackbox-dashboard-v1'))")
    with page.expect_download() as download:
        page.locator('#backupJson').click()
    assert json.loads(Path(download.value.path()).read_text())==data
    # Simulated HTTP only. Production JSON remains empty and unconfigured.
    fixture=json.loads(Path('data/platforms.json').read_text())
    fixture['platforms']['douyin'].update(state='ok',lastSuccessAt='2026-11-11T00:00:00Z',works=[{'id':'a'*64,'date':'2026-11-10','likes':12,'comments':3}])
    page.route('**/data/platforms.json',lambda route:route.fulfill(json=fixture))
    page.goto(BASE+'/#overview',wait_until='networkidle')
    page.reload(wait_until='networkidle')
    assert '点赞 12' in page.locator('#autoWorks').inner_text()
    page.locator('#rangePreset').select_option('custom')
    inputs=page.locator('#customRange input')
    inputs.nth(0).fill('2020-01-01');inputs.nth(1).fill('2020-01-02')
    page.locator('#applyRange').click()
    assert '暂无' in page.locator('#autoWorks').inner_text()
    assert data==page.evaluate("JSON.parse(localStorage.getItem('blackbox-dashboard-v1'))")
    page.unroute('**/data/platforms.json')
    page.route('**/data/platforms.json',lambda route:route.fulfill(status=500,body='failed'))
    page.reload(wait_until='networkidle')
    assert '读取失败' in page.locator('#collectionStatus').inner_text()
    assert not errors,errors
    browser.close()
print('PASS: navigation, CSV/history, reload, JSON backup, automatic metrics, date filter, failure message; fixtures never published')
