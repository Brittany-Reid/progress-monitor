const ProgressMonitor = require("..");

/**
 * Simple example of showing progress across multiple functions.
 */
function main(){
    //main monitor
    var monitor = new ProgressMonitor(100);

    //start event
    monitor.on("start", function(){
        console.log("STARTING...");
    });

    //work event, print percentage every 10%
    var toPrint = 10;
    var buffer = 0;
    monitor.on("work", function(value){
        buffer += value;
        if(buffer >= 10){
            buffer = 0;
            console.log(toPrint + "%");
            toPrint+=10;
        }
    });

    //end event
    monitor.on("end", function(){
        console.log("DONE!");
    });

    //first set of work
    console.log("LOOP 1");
    var subMonitor1 = monitor.split(50);
    work(subMonitor1);

    //second set of work
    console.log("LOOP 2");
    var subMonitor2 = monitor.split(50);
    work(subMonitor2);

    //finish main
    monitor.emit("end");

    return;
}

/**
 * Preforms some work.
 * @param {ProgressMonitor} monitor - the monitor we report to.
 */
function work(monitor){
    //adjust the total, this way functions don't need to know the original amount of work
    var subMonitor = ProgressMonitor.adjustTotal(monitor, 100);

    //do the work
    for(var i=0; i<100; i++){
        subMonitor.emit("work", 1);
    }

    //report end of work
    subMonitor.emit("end");

    return;
}

main();