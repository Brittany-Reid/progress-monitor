# progress-monitor

Splittable progress monitor for node.js, inspired by Eclipse IProgressMonitor and SubMonitor. Extends EventEmitter to provide a simple API. The goal is to provide easy to use progress monitoring across different parts of a program without those parts needing to know about how much work there is.

Still in progress! The API is not stable, please specify a specific version in your package.json if you want to use this!

## Installation

```sh
npm install x
```

## Usage

- At the start of a method call adjustTotal().
- Whenever you want to call a new method, use split() to create a new child monitor.

```js
const ProgressMonitor = require("progress-monitor");

//create new monitor
var monitor = new ProgressMonitor(100);

//create submonitor for 50/100 work of monitor
var subMonitor1 = monitor.split(50);
//do some work in another function
work(subMonitor1);

//do rest of work
monitor.work(50);

//report end of work
monitor.emit("end");

/**
 * Preforms some work.
 */
function work(monitor) {
  //adjust the total, this way functions don't need to know the original amount of work
  var subMonitor = ProgressMonitor.adjustTotal(monitor, 100);

  //do the work
  for (var i = 0; i < 100; i++) {
    subMonitor.emit("work", 1);
  }

  //report end of work
  subMonitor.emit("end");

  return;
}
```

### constructor(total : number)

Create a new progress monitor with `total` amount of work.

```js
const ProgressMonitor = require("progress-monitor");

var monitor = new ProgressMonitor(100);
```

### ProgressMonitor.adjustTotal(monitor: ProgressMonitor, newTotal : number)
Static function to adjust the total of a passed monitor to `newTotal`. Returns the monitor after scaling. Returns null if the monitor has already begun/has children.

```js
const ProgressMonitor = require("progress-monitor");

var monitor = new ProgressMonitor(); //default 100
monitor = ProgressMonitor.adjustTotal(monitor, 10);
```

### split(total: number)
Create a new child monitor that will work for `total` of parent's work. In the following example, a submonitor is made for 50 out of 100 of the parent's work. When the child is done it will have consumed 50 of the 100 work. The child will be initialized with a total work of 50, you can use adjustTotal to scale this back to 100, but it will still account for the same percentage as the parent.

```js
const ProgressMonitor = require("progress-monitor");

var monitor = new ProgressMonitor(100);
var subMonitor = monitor.split(50);
```


### Events

Emit and handle start, work and end events using the EventEmitter API.

#### start()

```js
monitor.on("start", function () {
  console.log("STARTING...");
});
monitor.emit("start");
```

#### work(value)

```js
//work event, print percentage every 10%
var toPrint = 10;
var buffer = 0;
monitor.on("work", function (value) {
  buffer += value;
  if (buffer >= 10) {
    buffer = 0;
    console.log(toPrint + "%");
    toPrint += 10;
  }
});

monitor.emit("work");
```

#### end()

```js
//end event
monitor.on("end", function () {
  console.log("DONE!");
});

monitor.emit("end");
```

## TO-DO
- I don't know if the events should be wrapped with functions, I wrote this quickly and I kind of like using the EventEmitter API.
- Add tests