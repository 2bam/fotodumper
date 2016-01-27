
# FOTODUMPER v2
Based on fotodumper by @armdz
Download entire http://fotolog.com account. Photos, comments, and extra data.
Saved as json, ready to parse and visualize.
ALSO INCLUDES "protolog" a very simple html fotolog like visualizer.

The downloaded files are in a folder thats is named as the fotolog account, with all the files inside.

The output will be a lot of "." and "i" for successful image and "Ex" for errors and retrys (unless verbose mode is set)

If you stop (or it fails enought times), it continues from the last id that failed

# USAGE

`node fotodump.js <fotolog-username>`

**(template and node_modules folders, ARE NEEDED)**

fotolog-username is the name you get from the link (http://www.fotolog.com/fotolog-username)

If for some reason it fails (e.g. sometimes last thumbnail pages are blank...), you must look the FIRST picture you posted and force to download it:

`node fotodump.js <fotolog-username> -f <first-image-number>`
(If your first image EVER's link is: http://www.fotolog.com/username/12345, use `node fotodump.js _username_ -f 12345`)

Full usage:
```
Usage: node fotodump.js [OPTION] <fotolog-username>

  -r, --retry=ARG        retry download times (default 10)
      --forget           don't start from where we left
  -f, --from=ARG         starts from a different pic id
  -s, --skip-downloaded  skips photos already in data/ or img/
  -t, --timeout=ARG      seconds to timeout request (default 5)
  -d, --dont-assemble    do not assemble protolog when finished processing
  -h, --help             display this help
  -v, --verbose          verbose output
```
Also, you can call: ```node fotoassemble.js <fotolog-username>``` to create the protolog from all downloaded data (if you had trouble or needed multiple passes)

# NOTES
This was made in case fotologs stop his activity, and to preserve part of the author's my life.
Under the impending pressure of fotolog closing, I've done the same.

## Important!
Sometimes fotolog _doesn't send the comments_ for some reason ($!#"%$)! Sometimes fotolog says _THE USER DOESN'T EXIST!_
This is taken as an error, and the extraction it's retried.
There is no way to determine photos without any actual comments, for this reason if it runs out of retries, it just saves the data without comments if this is the source of the failure.

# KEYS
For protolog, use 'q' and 'w' to navigate the photos withouth the mouse!

http://armdz.com (Original author)

http://2bam.com (This version's)
