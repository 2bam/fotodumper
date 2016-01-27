
# FOTODUMPER v2
Based on fotodumber by @armdz
Download entire http://fotolog.com account. Photos, comments, and extra data.
Saved as json, ready to parse and visualize.
ALSO INCLUDES "protolog" a very simple html fotolog like visualizer.

The downloaded files are in a folder thats is named as the fotolog account, with all the files inside.

# USAGE (template and node_modules folders, ARE NEEDED)

node fotodump.js <fotolog-username>

fotolog-username is the name you get from the link (http://www.fotolog.com/fotolog-username)

Full usage: node fotodump.js [OPTION] <fotolog-username>
Fotolog account dumper v2
  -r, --retry=ARG    retry download times (default 10)
  -f, --from=ARG     starts from a different pic id
  -t, --timeout=ARG  seconds to timeout request (default 5)
  -h, --help         display this help
  -v, --verbose      verbose output

# NOTES
This was made in case fotologs stop his activity, and to preserve part of the author's my life.
Under the impending pressure of fotolog closing, I've done the same.

[Important!] Sometimes fotolog doesn't send the comments for some reason ($!#"%$)! This is taken as an error, and the extraction it's retried.
There is no way to determine photos without any actual comments, for this reason if it runs out of retries, it just saves the data without comments if this is the source of the failure.

# KEYS
For protolog, use 'q' and 'w' to navigate the photos withouth the mouse!

http://armdz.com (Original author)
http://2bam.com (This version's)
