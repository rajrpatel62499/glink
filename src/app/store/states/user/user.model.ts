
export class User {
  id: string;
  first: string;
  last: string;
  username: string;
  token: string;
  eula: string;

  constructor(
    id?: string,
    first?: string,
    last?: string,
    username?: string,
    token?: string,
    eula?: string
  ) {
    this.id = id;
    this.first = first;
    this.last = last;
    this.username = username;
    this.token = token;
    this.eula =eula;
  }
}
