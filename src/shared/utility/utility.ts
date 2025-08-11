function padLeft(input: string | number, length: number, padChar: string = '0'): string {
    const inputStr: string = input.toString();
    const paddingLength: number = Math.max(0, length - inputStr.length);
    return padChar.repeat(paddingLength) + inputStr;
}

export function convertMinutesToHoursAndMinutes(minutes: number): string {
    if (minutes < 0) {
        throw new Error('Input value must be a non-negative number.');
    }

    const hours: number = Math.floor(minutes / 60);
    const remainingMinutes: number = minutes % 60;

    const hoursStr: string = padLeft(hours, 2);
    const minutesStr: string = padLeft(remainingMinutes, 2);

    return `${hoursStr}:${minutesStr}`;
}

export function setDay(shortDay):string {
    if (shortDay == "Mon") {
      return "Monday";
    } else if (shortDay == "Tue") {
      return "Tuesday";
    } else if (shortDay == "Wed") {
      return "Wednesday";
    } else if (shortDay == "Thu") {
      return "Thursday";
    } else if (shortDay == "Fri") {
      return "Friday";
    } else if (shortDay == "Sat") {
      return "Saturday";
    } else if (shortDay == "Sun") {
      return "Sunday";
    }
  }

  