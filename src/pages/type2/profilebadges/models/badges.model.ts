export class BadgeModel {
  image_url: String;
}

export class BadgeTransactionModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  Badge: BadgeModel;
  reward_category: string;
  reward_categoryname: string;
  rewardedBy: string;
  reward_description: string;
  reward_date: string;
  isClaimed: number;
  claim_date: string;
}
