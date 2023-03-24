## Why is there a JavaScript bot now?
Dear mods,

Greetings.

Just finished listening in (I guess) the first meeting in the r/place Bronies Discord server. Having noticed that towards the end of the meeting, there are several mods confused about why there would be another headless bot implementation going right now, I'd like to trying explaining in this sort-of letter all in one go.

There is already a headless bot, a Python one written by Twi/Leah (or Cloudburst? I don't know which name they'd prefer), and it was indeed good enough for the last year, but there were a couple of drawbacks that I experienced myself, and heard from others when I was convincing them to deploy headless bots, which made me start developing the JS version of the headless bot. This isn't either an attempt to try undermine what the other developers have achieved, or the implement something in every other language shenanigans, but rather, an attempt to revise and make the work much more approachable.

So here comes the first, and the most annoying reason, that the Python bot wasn't feasible enough for an average user to try deploying.

When first setting it up, you're required to install a bunch of dependencies by yourself, and sometimes it can take quite a while before the dependencies are all installed, soon followed by a bunch of environment preparation. That's not friendly to anyone without any experience of software development. I tried to help with that by submitting a helper script to take care of nearly everything, but that approach can only go so far.

With the JS bot, none of the above was needed at all. To install it, nix and Android users can just paste a command into their terminal, then let it do the rest. Windows users also have the option to download a bundle containing everything they need, and extract it to a desired folder. As such, the whole installation process takes no more than 30 seconds, usually even in a sub-10 scale. nix and Android users are then offered a helper command to take care of everything else, including automatic updates and self restarts, while Windows users can copy and paste the offered command to finish their setup. If they don't want to manage the bots in a command line, they're even offered to manage through a web browser. The bar of entry on headless bots? Massively reduced, I assume.

The second reason was cross-platform compatibility. I successfully attempted to run the Python bot on an Android phone last year, and implemented that automation flow into the helper script, but that was also a somewhat failure, since a bunch of people attempted to run the bot on Android and failed. So this time with the JS version, every single platform is tested (Windows, Linux and Android. I don't own a Mac, so its support may suffer) and made sure they'll run smoothly. And Android users don't need to feel left out anymore, they are now also free to join the fight through their pockets! (iOS users _might_ get the Python bot running on their iPhones soon as well)

The third reason was support of mass deployment. Python bot isn't that great when getting mass deployed, since each instance stores their own templates seperately in their own process, and each process can only manage a single account. The JS implementation can manage as many accounts as the user wants in a single instace, with relatively more powerful choices of management.

So, after all above, I decided to write a JS version of the headless bot. I don't speak Python, but I do write JavaScript. I myself can make no guarantee that the JS implementation will be ready as soon as Reddit launches the event, but I can guarantee that it's the most approachable headless implementation to a newbie. For the past days, I wasn't getting much sleep at all due to the development, however that's worth it for the fandom. My only hope was that somehow, when firepower is critically required, everyone can just join with what's already available at hoof, without any further worries.

That should conclude it for now. There are screenshots of the JS implementation I posted in the dev channel. Feel free to check them out.

Best regards,

Lumière Élevé

24 Mar 2023
