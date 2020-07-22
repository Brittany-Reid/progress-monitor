const { EventEmitter } = require("events");

class ProgressMonitor extends EventEmitter {
  /**
   * Create a new progress monitor with `total` amount of work.
   * @param {number} total - Total amount of work, default 100.
   */
  constructor(total = 100) {
    super();

    //parent if any
    this.parent;
    //how much work of the parent this monitor is
    this.totalOfParent;
    //how much work sent to parent
    this.sentToParent = 0;
    this.children = [];

    //total work to be done
    this.total = total;
    //how much work has been done in this monitor
    this.currentWorked = 0;
    //how much of this total is allocated to children
    this.childTotal = 0;
    //how much work from children has been done
    this.childWorked = 0;

    //state
    this.state = {};
    this.state.done = false;
    this.state.started = false;
    this.state.cancelled = false;

    //set up listeners
    this.initialize();
  }

  /**
   * Internal function to initialize event listeners.
   */
  initialize() {
    this.on("start", this.start);
    this.on("end", this.end);
    this.on("work", this.work);
  }

  /**
   * Static function to adjust the total of a passed monitor to `newTotal`.
   * Returns the monitor after scaling.
   * Returns null if the monitor has already begun/has children.
   * @param {ProgressMonitor} monitor - The progress monitor to adjust.
   * @param {number} newTotal - The new total to adjust to.
   */
  static adjustTotal(monitor, newTotal) {
    //if completed or already started, ignore
    if (monitor.state.done || monitor.state.started) return;
    //no scaling if we have children, split a new subprocess!
    if (monitor.children.length > 0) return;

    var oldTotal = monitor.total;
    var scale = newTotal / oldTotal;

    monitor.total = newTotal;
    monitor.currentWorked = monitor.currentWorked * scale;
    return monitor;
  }

  /**
   * Internal start function. Call .emit("start")
   */
  start() {
    //does nothing if we already started
    if (this.state.started) return;
    //set state
    this.state.started = true;
  }

  /**
   * Internal end function. Call .emit("emd")
   */
  end() {
    //already completed
    if (this.state.done) return;
    //if not begun, begin
    if (!this.state.started) {
      this.emit("start");
    }

    if (this.parent) {
      //update parent
      this.parent.childWorked += this.totalOfParent - this.sentToParent;
    }

    //set state
    this.state.done = true;
  }

  /**
   * Create a new child monitor that will work for `total` of parent's work.
   * @param {number} total - The amount of parent's work to assign to the child. 
   */
  split(total) {
    //already completed
    if (this.state.done) return;

    //split must be available
    var available = this.available();
    if (total > available) {
      return;
    }

    //allocate total to this child
    this.childTotal += total;

    //create new child
    var subMonitor = new ProgressMonitor(total);
    subMonitor.parent = this;
    subMonitor.totalOfParent = total;
    this.children.push(subMonitor);

    return subMonitor;
  }

  available() {
    return this.total - this.childTotal - this.currentWorked;
  }

  updateParent(value) {
    //must have parent
    if (!this.parent) return;

    //get value as part of parent
    value = value * (this.totalOfParent / this.total);
    this.sentToParent += value;

    //call parent
    this.parent.emit("work", value, true);
  }

  work(value, child = false) {
    //already completed
    if (this.state.done || this.worked() >= this.total) return;
    //if not begun, begin
    if (!this.state.started) {
      this.emit("start");
    }

    //check available
    var available = this.available();
    if (child) {
      var available = this.childTotal - this.childWorked;
    }
    if (value > available) {
      value = available;
    }

    if (value > 0) {
      if (child) {
        this.childWorked += value;
        //console.log(this.worked());
      } else {
        this.currentWorked += value;
        //console.log(this.worked());
        this.updateParent(value);
      }
    }

    // if (this.worked() >= this.total) {
    //   this.emit("end");
    //   return;
    // }
  }

  worked() {
    return this.childWorked + this.currentWorked;
  }
}

module.exports = ProgressMonitor;
