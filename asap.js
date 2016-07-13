"use strict";

function rawAsap(task){
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    queue[queue.length] = task;
}

var queue = [];
var flushing = false;
var requestFlush;
var index = 0;
var capacity = 1024;

function flush(){
    while(index < queue.length ){
        var currentIndex = index;
        index += 1;
        queue[currentIndex].call();

        if (index > capacity ) {
            for(var scan = 0 , newLength = queue.length-index;scan < newLength ; scan++){
                queue[scan] = queue[scan+index];
            }
            queue.length -= index;
            index = 0;
        }
    }

    queue.length = 0;
    index = 0;
    flushing = false;
}

var BrowserMutationObserver = window.MutationObserver || window.WebKitMutationObserver;

if ( typeof BrowserMutationObserver === 'function') {
    requestFlush = makeRequestCallFromMutationObserver(flush);
}else{
    requestFlush = makeRequestCallFromTimer(flush);
}

rawAsap.requestFlush = requestFlush;

function makeRequestCallFromMutationObserver(callback){
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node , {characterData:true});

    return function requestCall(){
        toggle = -toggle;
        node.data = toggle;
    }
};

function makeRequestCallFromTimer(callback){
    return function requestCall(){
        var timeoutHandle = setTimeout(handleTimer , 0);
        var intervalHandle = setInterval(handleTimer,50);

        function HandlerTimer(){
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    }
}

rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

var freeTasks = [];
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

function RawTask() {
    this.task = null;
}

RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            asap.onerror(error);
        } else {
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};
