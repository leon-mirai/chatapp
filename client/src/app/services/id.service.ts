import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdService {
  generateId(name: string): string {
    const cleanName = name.trim().toLowerCase().split(' ').join('-');
    const randomString = Math.random().toString(36).slice(2, 6); // convert decimal to base-36. (a-z + 0-9). slice starts code at after decimal
    return `${cleanName}-${randomString}`;
  }
}
