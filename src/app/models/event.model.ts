export interface Event {
    target: HTMLTextAreaElement;
    id: string,
    name: string,
    creatorId: string,
    Image: string,
    description: string,
    date: string,
    location: {
        lng: number,
        lat: number,
    },
    applicants: string[],
    confirmed: string[],
    
}
 