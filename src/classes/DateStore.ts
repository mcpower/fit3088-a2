export default class DateStore {
    date: Date;
    constructor() {
        this.date = new Date();
    }

    offset(ms: number) {
        this.date = new Date(this.date.getTime() + ms);
    }
}
