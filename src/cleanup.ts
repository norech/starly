import { createInterface } from "readline";

const registeredCleanups: Array<() => Promise<any>> = [];

export function registerCleanup(callback: () => Promise<any>) {
    registeredCleanups.push(callback);
};

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})

let wasCleanedUp = false;

// catch ctrl+c event and exit normally
rl.on('SIGINT', function () {
    if(!wasCleanedUp) {
        rl.pause();
        console.log("Cleaning up...");

        Promise.all(registeredCleanups.map(cleanup => cleanup()))
            .then(e => {
                wasCleanedUp = true;
                console.log("Done");
                rl.resume();
                process.exit();
            }).catch(e => {
                wasCleanedUp = true;
                console.log('Uncaught Exception...');
                console.log(e.stack);
                rl.resume();
                process.exit();
            });
    }
});