import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdService {
  generateId(name: string): string {
    const cleanName = name.trim().toLowerCase().split(' ').join('-');
    const randomString = Math.random().toString(36).slice(2, 6); // 
    return `${cleanName}-${randomString}`;
  }
}
