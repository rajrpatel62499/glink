import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class FormService {

    public markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).map((key) => {
            formGroup.controls[key].markAsTouched();
            formGroup.controls[key].markAsDirty();
            const mayBeFG = formGroup.controls[key] as FormGroup;
            if (mayBeFG.controls) {
                this.markFormGroupTouched(mayBeFG);
            }
        });
    }
    public markFormGroupUnTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).map((key) => {
            formGroup.controls[key].markAsUntouched();
            formGroup.controls[key].markAsPristine();
        });
        formGroup.markAsPristine();
    }

    public disableFormGroupControls(form: FormGroup) {
        for (const key in form.controls) {
          form?.get(key)?.disable()
        }
    }

    public findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray): string[] {
        var invalidControls: string[] = [];
        let recursiveFunc = (form: FormGroup | FormArray) => {
          Object.keys(form.controls).forEach(field => {
            const control = form.get(field);
            if (control?.invalid) invalidControls.push(field);
            if (control instanceof FormGroup) {
              recursiveFunc(control);
            } else if (control instanceof FormArray) {
              recursiveFunc(control);
            }
          });
        }
        recursiveFunc(formToInvestigate);
        return invalidControls;
    }

    public removeFormGroupValidators(form: FormGroup) {
        for (const key in form.controls) {
          form?.get(key)?.clearValidators();
          form?.get(key)?.updateValueAndValidity();
        }
    }
    
}
