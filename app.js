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
                console.log(step)
                return step
                // if (step.stepDetail.type == 'Connect') {
                    
                //     await Promise.all([
                //         await connectTo(step.stepDetail.details.url),
                //         ,
                //     ])
                // } else if (step.stepDetail.type == 'Disconnect') {
                    
                //     await browser.close()
                // }
            })
            return someSteps
        }

        async function runSteps(stepArray){
            for (const i in stepArray) {
                const element = await stepArray[i].run();
                console.log(element)
            }
            // stepArray.forEach(step => {
            //     runStep(step)
            // })
        }
        
        
      
        //await page.goto('https://amazon.com');
        //await page.screenshot({path: 'example.png'});
        
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