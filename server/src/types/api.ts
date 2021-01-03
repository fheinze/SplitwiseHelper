export type Group = {
  id: number;
  name: string;
  avatar: {
    large: string;
  };
};

export type Metadata = {
  user: User;
  groups: Group[];
  categories: Category[];
};

export type User = {
  id: string;
  first_name: string;
  last_name: string;
};

export type Expense = {
  id: number;
  description: string;
  deleted_at: string;
};

export type Category = {};