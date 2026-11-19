export interface Family {
  /** The document id equals the join code (see familyService). */
  id: string;
  name: string;
  createdBy: string;
  joinCode: string;
  memberIds: string[];
  createdAt: string;
}
