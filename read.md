mapObjects<T, U>(sourceArray: T[], destinationType: U, mappingConfig: { sourceProp: string, destinationProp: string }[]): U[] {
    return sourceArray.map(source => this.mapObject(source, destinationType, mappingConfig));
  }

  mapObject<T, U>(source: T, destinationType:U, mappingConfig: { sourceProp: string, destinationProp: string }[]): U {
    const destination: U = {} as U;

    mappingConfig.forEach(config => {
        const sourcePropValue = source[config.sourceProp];
        if (sourcePropValue !== undefined) {
            const destinationProp = config.destinationProp as keyof U;
            destination[destinationProp] = sourcePropValue;
        }
    });

    return destination;
 } 


 const destinationObject = this.mapObject(
        res.data.getMonthlySessionDetails,
         this.sample_desination,
            [
               { sourceProp: 'start_date', destinationProp: 'StartDate' },
               { sourceProp: 'end_date', destinationProp: 'EndDate' },
             ]
);

//const sample_desination:{ Id: string, Month: string, Year: string }[] = [];


const destinationObject = this.mapObjects(
            res.data.getAllMonthlySessionMember,
            sample_desination,
            [
              { sourceProp: 'id', destinationProp: 'Id' },
              { sourceProp: 'month', destinationProp: 'Month' },
              { sourceProp: 'year', destinationProp: 'Year' },
            ]
        );        