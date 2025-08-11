
export function convertToMinutes(time): string {
    const [hours, minutes] = time.split(':').map(Number);
    var s = hours * 60 + minutes;
    return s.toString(); 2
}

export function customPadStart(input: string | number, targetLength: number, padString: string): string {
    const inputStr: string = String(input);
    if (inputStr.length >= targetLength) {
        return inputStr;
    } else {
        const padding: string = padString.repeat(targetLength - inputStr.length).slice(0, targetLength - inputStr.length);
        return padding + inputStr;
    }
}

export function convertToHoursMinutes(minutes: number): string {
    // Calculate the hours and minutes
    const hours: number = Math.floor(minutes / 60);
    const minutesRemainder: number = minutes % 60;

    // Format the time as "hh:mm" using custom padStart function
    const timeStr: string = `${customPadStart(hours, 2, '0')}:${customPadStart(minutesRemainder, 2, '0')}`;
    return timeStr;
}

export function formatTransationDate(dateString: string): string {
    //const dateString = "2024-03-18T13:17:53.168Z";
    const dateObject = new Date(dateString);

    //Format the date as "DD-MMM" using the default locale
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
    };
    const formattedDate = dateObject.toLocaleDateString(undefined, options).replace(',', '');
    console.log(formattedDate);
    return formattedDate;
}