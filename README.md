
# FOTODUMPER v2.3
**[INSTRUCCIONES EN ESPAÑOL](LEAME.md)**

Based on fotodumper by @armdz

Download entire http://fotolog.com account. Photos, comments, and extra data. Saved as json, ready to parse and visualize.
ALSO INCLUDES "protolog", a very simple html fotolog like visualizer.

This version intends to be more robust against fotolog's errors and server discrepancies (you wouldn't believe how many there are).
It can continue from where you left or failed. The downloaded files are in a folder thats is named as the fotolog account, with all the files inside.
You access protolog opening `index.html`

# USAGE

**MAKE SURE YOUR FOTOLOG IS ACTUALLY WORKING**

`node fotodump.js fotolog-username`

Run it multiple times if it fails.

## Detailed howto

* [Download and install node.js (https://nodejs.org/)](https://nodejs.org/).
* [Download this program's ZIP file](https://github.com/2bam/fotodumper/archive/master.zip) ("Download ZIP" top-right in https://github.com/2bam/fotodumper) and unzip it.
* _(In Windows)_ Right click holding the SHIFT key inside the unzipped folder and click "Open command window here"
* Run this command: `node fotodump.js fotolog-username`
fotolog-username is the name you get from the link (http://www.fotolog.com/fotolog-username)

**MAKE SURE YOUR FOTOLOG IS ACTUALLY WORKING**

**If it fails check your folder and firewall permissions, try to run as administrator (shouldn't be needed)**

**Remember template and node_modules folders, ARE NEEDED**


# Extended usage:
Read [READMORE.md](READMORE.md)

# AUTHORS

http://armdz.com (Original author)

http://2bam.com (This version's)

## In memoriam: \_c\_bunny\_
