# Output
In non-verbose mode:
* `_` means skipped file
* `.` means downloaded data (message, comments...)
* `i` means downloaded image/photo
* `nx` means no comments (sometimes a bug) and `x` is the retry number. These may be safe if there were actually no comments.
* `Ex` means error and `x` is the retry number.
* `M(x/y)` means a mismatch for "next photo" was found (continue from both of these numbers using `-f` if it fails here)

# Changelog

### v2.2
Endless loop/mismatched id to real-id detections (badly indexed fotolog links throw you to the first page)

### v2.1
Now it changes so it crawls backwards instead of forward, more user friendly in that matter.
_(If you already started using v2.0, you should use "--forget --adapt" options to work with already downloaded files)_


# Migrating from v2.0
If you already started downloading with v2.0, you should call `--adapt --forget` to discard first and last photos downloaded and make skipping work again

# Starting from an specific photo

`node fotodump.js <fotolog-username> -f <first-image-number>`

# Extended usage:
```
Usage: node fotodump.js [OPTION] <fotolog-username>

  -r, --retry=ARG             retry download times (default 10)
  -n, --no-comment-retry=ARG  retry no-comments bug times before accepting there
 are none (default=3)
      --forget                don't start from first found id
      --no-images             don't download images
  -f, --from=ARG              starts from a different pic id
  -x, --force-download        redownload even if pressent in data/ and img/
  -t, --timeout=ARG           seconds to timeout request (default 5)
  -d, --dont-assemble         do not assemble protolog when finished processing
  -a, --adapt                 redownload first and last...
  -h, --help                  display this help
  -v, --verbose               verbose output
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
Intermixed date types (DD MMM YYYY with sporadic MMM DD YYYY)
In some pictures, pressing the arrow or picture sends you straight to the first photo
...but this can be saved by another link, which sometimes _is also missing (sigh)..._
If something gets stuck, you can Ctrl+C and continue from the last failed photo.

I try to workaround all these weird behaviours.
