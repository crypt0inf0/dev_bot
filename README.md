## Avalon bot's

### Post
`setInterval` & `Promise` doesn't work well. So for simplicity we use bash command `watch -n 60 'node post.js | tee -a post.txt' &>/dev/null &` which will run every 60 sec.

`watch` command gets exit once we close the terminal so we use while loop & nohup,

```
#!/bin/bash
# Program that checks if MySQL is running
while [ 1 = 1 ]; do
<your code here>
sleep 60
done
```
```
nohup /path/to/loop_script.sh & > /dev/null
```
To stop the post bot use kill command,
```
pkill -9 name_of_the_bash_script
```
