#!/usr/bin/perl
$scriptName = 'nami.js';
$logPath='/var/www/nami/log';
$action = shift(@ARGV);
if($action eq 'start'){
   `forever start -a -l $logPath/logging.log -o $logPath/console.log -e $logPath/errors.log $scriptName`;
}
elsif($action eq 'stop'){
    `forever stop $scriptName`;
}
elsif($action eq 'restart'){
    `forever restart $scriptName`;
}
else{
    print "\n================================================================\n\nPlease use './go.pl [start|stop|restart]'\n\n================================================================\n";
}