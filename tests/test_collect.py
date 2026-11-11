import copy
import json
from pathlib import Path
import tempfile
import unittest
from scripts.collect import collect, project, run, CollectionError

ENV = {'DOUYIN_CLIENT_KEY':'test-key','DOUYIN_OPEN_ID':'test-account',
       'DOUYIN_REFRESH_TOKEN':'test-secret','DOUYIN_PUBLIC_ITEM_IDS':'["test-public"]',
       'DOUYIN_PUBLICATION_APPROVED':'true'}
ITEM = {'item_id':'test-public','create_time':1794272400,'is_reviewed':True,
        'title':'never publish text', 'open_id':'private-user', 'orders':[{'phone':'secret'}],
        'statistics':{'digg_count':12,'comment_count':3,'play_count':9000,'download_count':8}}

class CollectorTests(unittest.TestCase):
    def fake(self, path, params, token=None):
        if path == '/oauth/refresh_token/':
            return {'access_token':'test-access','open_id':'test-account','refresh_token':'test-secret'}
        self.assertEqual(token,'test-access')
        return {'list':[ITEM,dict(ITEM,item_id='unapproved')],'has_more':False}

    def test_allowlist_projection(self):
        works=collect(self.fake,ENV)
        self.assertEqual(len(works),1)
        self.assertEqual(set(works[0]),{'id','date','likes','comments'})
        serialized=json.dumps(works)
        for secret in ['test-public','private-user','orders','play_count','9000','test-access','never publish']:
            self.assertNotIn(secret,serialized)
        self.assertEqual(works[0]['likes'],12)

    def test_missing_approval_never_calls_api(self):
        self.assertIsNone(collect(lambda *args: self.fail('API called'),{}))

    def test_private_unreviewed_invalid_metrics(self):
        self.assertIsNone(project(dict(ITEM,is_private=True)))
        self.assertIsNone(project(dict(ITEM,is_reviewed=False)))
        for n in [-1,True,1.5,'12',2**53]:
            with self.assertRaises(CollectionError):
                project(dict(ITEM,statistics={'digg_count':n,'comment_count':1}))

    def test_pages_and_cursor_loop(self):
        calls=[]
        def fetch(path, params, token=None):
            if token is None:return self.fake(path,params)
            calls.append(params['cursor'])
            return {'list':[ITEM], 'has_more':len(calls)==1,'cursor':20}
        self.assertEqual(len(collect(fetch,ENV)),1)
        self.assertEqual(calls,[0,20])
        def loop(path,params,token=None):
            if token is None:return self.fake(path,params)
            return {'list':[],'has_more':True,'cursor':0}
        with self.assertRaises(CollectionError):collect(loop,ENV)

    def test_account_mismatch_and_rotated_refresh(self):
        for patch in [{'open_id':'another-account'}, {'refresh_token':'rotated-secret'}]:
            def fetch(path,params,token=None):return dict(self.fake(path,params),**patch)
            with self.assertRaises(CollectionError):collect(fetch,ENV)

    def test_failure_retains_last_success_and_sanitizes(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'platforms.json'
            path.write_text(Path('data/platforms.json').read_text())
            self.assertEqual(run(self.fake,ENV,path),0)
            old=json.loads(path.read_text())['platforms']['douyin']
            def fail(*args):raise RuntimeError('https://secret?token=private')
            self.assertEqual(run(fail,ENV,path),1)
            new=json.loads(path.read_text())['platforms']['douyin']
            self.assertEqual(new['works'],old['works'])
            self.assertEqual(new['lastSuccessAt'],old['lastSuccessAt'])
            self.assertEqual(new['state'],'error')
            self.assertNotIn('token=',path.read_text())
            self.assertEqual(run(fail,{},path),0)
            self.assertEqual(json.loads(path.read_text())['platforms']['douyin']['works'],[])

    def test_does_not_publish_partial_pagination(self):
        def broken(path,params,token=None):
            if token is None:return self.fake(path,params)
            if params['cursor']==0:return {'list':[ITEM],'cursor':20,'has_more':True}
            raise CollectionError()
        with self.assertRaises(CollectionError):collect(broken,ENV)

if __name__=='__main__':unittest.main()
