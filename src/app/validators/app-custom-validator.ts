import { Validators, FormControl, FormGroup, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export class AppCustomValidator extends Validators {

    static fromDateValidator(fdValue: FormControl) {
        const date = fdValue.value;      
        if (date ===null || date==='') return { requiredFromDate: true };      
      }
    
       static toDateValidator(todValue: FormControl) {
        const date = todValue.value;       
        if (date ===null || date==='') return { requiredToDate: true };      
      }

      //different ways of validating Cross field validations
      static compareDates(formGroupValues: FormGroup) {       
        if(formGroupValues.get('startDate') && formGroupValues.get('endDate')){
        const fromDate = formGroupValues.get('startDate').value;        
        const toDate = formGroupValues.get('endDate').value;
        if(fromDate > toDate){         
            return {notValid:true };
        }
      }     
        return {notValid:false };
      }

      static dateLessThan(dateField1: string, dateField2: string, validatorField: { [key: string]: boolean }): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            const fromDt = c.get(dateField1).value;
            const toDt = c.get(dateField2).value;            
            if ((fromDt !== null && toDt !== null) && fromDt > toDt) {              
                return validatorField;
            }
            return null;
        };
    }

   static identityRevealedValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
      const startDate = control.get('startDate');
      const endDate = control.get('endDate');     
      return startDate && endDate && startDate.value > endDate.value ? { 'invalidDates': true } : null;
    };
}
