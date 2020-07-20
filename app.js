const puppeteer = require('puppeteer');
const stepData = require("./gatherStepData");
//const firstStepDetails=parsedStepDetails[`firstStepId`]

const main = (async () => {
    try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const steps = createSteps();
        runSteps(steps)
        
        function createSteps(){
            let linkedSteps = stepData.gatherStepData().steps;
            const someSteps = linkedSteps.map(step => {
                step.puppetPage = page;
                step.puppetBrowser = browser;
                return step
            })
            return someSteps
        }

        async function runSteps(stepArray){
            for (const i in stepArray) {
                const element = await stepArray[i].run();
                //console.log(element)
            }
        }
    }
    catch(err){
        console.log(err)
    }
});

main()


// function createStepObject(stepDetails){

// }

// class Step {
    
// }