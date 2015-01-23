#!/usr/bin/env python

from __future__ import print_function
import os
from subprocess import call

currentdir = os.path.dirname(os.path.realpath(__file__))

def main():
	try:
		os.remove(currentdir+"/Packages")
		os.remove(currentdir+"/Packages.bz2")
		os.remove(currentdir+"/Release")
	except OSError as e:
		if e.errno == 2:
			print("Could not find a file to delete - assuming files already removed.")
	PIPE = ""
	with open(currentdir+"/Packages","w") as packagesfile:
		call(["dpkg-scanpackages","-m",currentdir,"/dev/null"], stdout=packagesfile)
	call(["bzip2","-k",currentdir+"/Packages"])
	os.copy

if __name__ == "__main__":
	main()