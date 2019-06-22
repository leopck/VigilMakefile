# VigilMakefile

Vigil was designed to be a watchdog that makes use of the mainstream Makefile.
Designed with the consideration of using Makefile as the main script to run install dependencies -> compilation -> install -> test
With Makefile being one of the most used system, I wanted a watchdog/automation system that is designed oriented around Makefile as the main processing language.

# Workflow that is being used

*Host machine with VSCode and RemoteSSHFS to remotely edit my code on my server
*Client machine running SSH and WatchDog-Makefile to compile my code each time a change happens on the project directory.
