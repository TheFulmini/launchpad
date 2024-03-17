export const getLaunchpadAwsAccounts = /* GraphQL */ `
  query GetLaunchpadasgetLaunchpadAwsAccounts($Id: String!) {
    getLaunchpadAwsAccounts(Id: $Id) {
      Id
      Name
      Arn
      Email
      Status
      JoinedMethod
      joinedTimestamp
      __typename
    }
  }
`;

export const listLaunchpadAwsAccounts = /* GraphQL */ `
  query ListLaunchpadAwsAccounts(
    $filter: TableLaunchpadAwsAccountsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLaunchpadAwsAccounts(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        Id
        Name
        Arn
        Email
        JoinedMethod
        JoinedTimestamp
        Status
        __typename
      }
      nextToken
      __typename
    }
  }
`;
