Boards
======

Setup
-----

You need nDistro setup which is outlined here: http://tjholowaychuk.com/post/864064044/ndistro-node-distribution-toolkit

You then can run 'ndistro' on the command line and it will setup local instances of NodeJS, ExpressJS and Connect which are all required for this project.

Running
-------

Run in the command line by typing:

  ./bin/node app.js

Things to do
------------

* better error handling
 * boards not found
 * file not found at startup
* refactoring function names
* refactoring into different files for routes, business logic, config etc
* add authentication and user context for boards
