const steps = require('./steps.json');
const stepDetails = require('./amazonScrape.json');

module.exports = {
    gatherStepData: function(puppetStuff){
        const result = {}
        result.steps = associateSteps()
        console.log(result)
        return result
    }
}

class Step {
    constructor(step, stepDetail){
        this.step = step;
        this.stepDetail = stepDetail;
        this.browser;
        this.page;
    }
    set puppetPage(page){
        this.page = page;
    }
    set puppetBrowser(browser){
        this.browser = browser;
    }
    run(){
        throw new Error('handled By Subclass')
    }
}

class ConnectStep extends Step {
    async run(){
        return await this.connect()
    }
    async connect(){
        try{
            console.log("Now connecting to "+ this.stepDetail.details.url);
            return await this.page.goto(this.stepDetail.details.url);
        }
        catch(err){
            console.log(err)
        }
    }
}

class DisconnectStep extends Step {
    async run(){
        return await this.disconnect()
    }
    async disconnect(){
        try{
            console.log("Now disconnecting")
            return await this.browser.close()
        }
        catch(err){
            console.log(err)
        }
    }
}

class NavigationStep extends Step {
    async run(){
        switch (this.stepDetail.details.searchUsing.type) {
            case "xPath": return await this.clickXpath();
            case "htmlIdentifier": return await this.clickHtmlElement();
            default:
                throw new Error(`Unknown search type: ${this.stepDetail.details.searchUsing.type}`)
        }
    }
    async clickElement(){
        console.log(`Clicking Element ${this.stepDetail.details.searchUsing.htmlIdentifier}`)
        return Promise.all([
            this.page.waitForNavigation('domcontentloaded'),
            this.page.click(this.stepDetail.details.searchUsing.htmlIdentifier)
        ])
    }
    async clickXpath(){
        console.log(`Clicking Element ${this.stepDetail.details.searchUsing.value}`)
        const [link] = await this.page.$x(this.stepDetail.details.searchUsing.value)
        if (link){
            return Promise.all([
                this.page.waitForNavigation('domcontentloaded'),
                link.click()
            ])
        } else {
            throw new Error(`Unable to find element with given xPath - ${this.stepDetail.details.searchUsing.value} on the page ${this.page.url()}`)
        }
    }
}

class ScrapeStep extends Step {
    async run(){
        console.log("Scrape step")
        return await Promise.resolve(0);
    }
}

function associateSteps(){
    return Object.keys(steps).map(key => {
        let stepId = steps[key].associated_step.id;
        let step = stepDetails[stepId]
        return createStepObject(steps[key],step);
    })
}

function createStepObject(aStep,aStepDetail){
    switch (aStepDetail.type) {
        case "Connect": return new ConnectStep(aStep,aStepDetail);
        case "Disconnect": return new DisconnectStep(aStep,aStepDetail);
        case "Navigation": return new NavigationStep(aStep,aStepDetail);
        case "Scrape": return new ScrapeStep(aStep,aStepDetail);
        default:
            throw new Error(`Unknown type: ${aStepDetail.type}`)
    }
}