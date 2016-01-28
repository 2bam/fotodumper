
# FOTODUMPER v2.1

Based on fotodumper by @armdz

Download entire http://fotolog.com account. Photos, comments, and extra data. Saved as json, ready to parse and visualize.
ALSO INCLUDES "protolog" a very simple html fotolog like visualizer.

This version intends to be more robust against errors and server discrepancies (you wouldn't believe how many there are).
It can continue from where you left or failed. The downloaded files are in a folder thats is named as the fotolog account, with all the files inside.
The output will be a lot of "." and "i" for successful image and "Ex" for errors and retrys (unless verbose mode is set)


## v2.1
Now it changes so it crawls backwards instead of forwards, more user friendly in that matter.
_(If you already started using v2.0, you should use "--forget --adapt" options to work with already downloaded files)_

# USAGE
`node fotodump.js <fotolog-username>`

## Detailed howto

* Download and install node.js (https://nodejs.org/).
* Download the ZIP (top-right in https://github.com/2bam/fotodumper) and unzip it.
* _(In Windows)_ Right click holding shift inside the unzipped folder and click "Open command window here"
* Run this command: `node fotodump.js <fotolog-username>`
fotolog-username is the name you get from the link (http://www.fotolog.com/fotolog-username)

**(Remember template and node_modules folders, ARE NEEDED)**

# Extended usage:
Read READMORE.md

# AUTHORS

http://armdz.com (Original author)

http://2bam.com (This version's)

## In memoriam: \_c\_bunny\_
