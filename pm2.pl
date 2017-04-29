#!/usr/bin/perl
$scriptName = 'nami.js';
$logPath='/var/www/nami/log';
$action = shift(@ARGV);
if($action eq 'start'){
   `pm2 start $scriptName -l $logPath/logging.log -o $logPath/console.log -e $logPath/errors.log`;
}
elsif($action eq 'stop'){
    `pm2 stop $scriptName`;
}
elsif($action eq 'restart'){
    `pm2 restart $scriptName`;
}
else{
    print "\n================================================================\n\nPlease use './run.pl [start|stop|restart]'\n\n================================================================\n";
}