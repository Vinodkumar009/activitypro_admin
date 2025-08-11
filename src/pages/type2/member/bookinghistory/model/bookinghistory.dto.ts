export class BookingHistoryInputDtO {

    parentId: string
    pageOptionsDto: {
        order: string,
        page: number,
        take: number
    }


}