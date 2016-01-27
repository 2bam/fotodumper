
# Extended usage:
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

# ROBUSTNESS
Sometimes connections time out.
Sometimes the server says there's no user by that name.
Sometimes it doesn't send the comments.
Sometimes the thumbnail view doesn't show photos, but they're there (a problem for autodetect)
Intermixed date types (DD/MMM/YYYY with sporadic MMM DD YYYY)
In some pictures, pressing the left arrow sends you straight to the first photo.
...but can be saved by another link, which sometimes _is also missing (sigh)..._
If something gets stuck, you can Ctrl+C and continue from the last failed photo.

I try to workaround all these weird behaviours.
