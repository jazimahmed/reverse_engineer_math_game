import sys, time, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'tools'))
from rea import Rea
from png import read

r = Rea()
r.sh('shell','am','force-stop','com.GamesForKids.Mathgames.MultiplicationTables')
time.sleep(1)
r.sh('shell','am','start','-n','com.GamesForKids.Mathgames.MultiplicationTables/.SplashScreenActivity')
time.sleep(12)
nodes = r.nodes()
for _ in range(12):
    if r.by_id(nodes,'addition'): break
    time.sleep(1); nodes = r.nodes()
r.tap_id(nodes,'addition',settle=1.5)
time.sleep(1.0)
nodes = r.nodes()
for n in nodes:
    if n.text=='Practice':
        r.tap_node(n, settle=1.0); break
t0=time.time()
for i in range(16):
    r.screenshot('_bgseq')
    img = read(r'C:\Users\Administrator\Desktop\REA\research\observations\runtime\_bgseq.png')
    print(f'{time.time()-t0:6.1f}s  {img.hex_at(540,1200)}  {img.hex_at(540,300)}  {img.hex_at(60,2200)}', flush=True)