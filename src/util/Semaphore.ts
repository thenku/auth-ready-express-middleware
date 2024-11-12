//because it's reusable we removed the singleton pattern
export default class Semaphore {
    private isLocked: boolean = false;
    // private static myInstance:Semaphore | null = null;

    constructor() {
        // if(!Semaphore.myInstance){
        //     Semaphore.myInstance = new Semaphore();
        // }
        // return Semaphore.myInstance;
    }
    public async acquire(): Promise<void> {
        while (this.isLocked) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
        }
        this.isLocked = true;
    }

    public release(): void {
        this.isLocked = false;
    }
}