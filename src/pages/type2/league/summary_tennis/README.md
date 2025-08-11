# Tennis Summary Implementation

This directory contains the tennis summary page implementation for the ActivityPro mobile application, following the same patterns as the football summary page.

## Files Structure

```
summary_tennis/
├── summary_tennis.ts           # Main component logic
├── summary_tennis.html         # Component template
├── summary_tennis.scss         # Component styles
├── summary_tennis.module.ts    # Angular module
├── score_input/               # Set score input modal
│   ├── score_input.ts
│   ├── score_input.html
│   ├── score_input.scss
│   └── score_input.module.ts
├── result_input/              # Match result input modal
│   ├── result_input.ts
│   ├── result_input.html
│   ├── result_input.scss
│   └── result_input.module.ts
├── tennis_result_sample.json  # Sample result JSON structure
└── README.md                  # This file
```

## Features

### Main Summary Page
- **Match Information Display**: Shows match title, date, location
- **Score Display**: Shows sets won by each team
- **Set Scores**: Displays individual set scores (e.g., "6-4", "7-5", "6-3")
- **POTM (Player of the Match)**: Allows selection and display of POTM
- **Statistics**: Tennis-specific stats with visual bar charts:
  - Aces
  - Double Faults
  - Winners
  - Unforced Errors
  - Break Points Won
  - Games Won
- **Doughnut Chart**: Visual representation of winners distribution
- **Stats Popups**: Editable popups for updating team statistics

### Input Modals
- **Result Input**: Set match result (sets won, games won)
- **Set Score Input**: Detailed set-by-set score entry
- **POTM Selection**: Player of the match selection (reuses existing modal)

## Data Structure

The tennis result JSON follows this structure:

```typescript
interface TennisResultModel {
  LEAGUE_FIXTURE_ID?: string;
  POTM?: POTMDetailModel[];
  HOME_TEAM?: TennisTeamStatsModel;
  AWAY_TEAM?: TennisTeamStatsModel;
  SET_SCORES?: TennisSetScoreModel[];
}

interface TennisTeamStatsModel {
  IS_WINNER?: boolean;
  NAME?: string;
  TEAM_ID?: string;
  SETS_WON?: number;
  GAMES_WON?: number;
  ACES?: number;
  DOUBLE_FAULTS?: number;
  FIRST_SERVE_PERCENTAGE?: string;
  WINNERS?: number;
  UNFORCED_ERRORS?: number;
  BREAK_POINTS_WON?: number;
}

interface TennisSetScoreModel {
  SET_NUMBER?: number;
  SCORE?: string;
  WINNER?: string;
}
```

## API Integration

The component integrates with the existing API endpoints:
- `Get_League_Match_Result`: Retrieves match result data
- `Get_League_Match_Participant`: Fetches participant data
- `Publish_League_Result_For_Activities`: Publishes match results

The `PublishLeagueResultForActivitiesInput` interface has been extended with a `Tennis` section to support tennis-specific data.

## Usage

To navigate to the tennis summary page, pass the following parameters:
- `match`: LeagueMatch object
- `leagueId`: League identifier
- `activityId`: Activity identifier
- `activityCode`: Activity code
- `homeTeam`: Home team participation object
- `awayTeam`: Away team participation object

## Styling

The component follows the same styling patterns as the football summary:
- Green color for home team stats
- Red color for away team stats
- Orange/gold color (#f6ae4d) for section headers
- Responsive design with proper mobile layout
- Custom popup styling for stat editing

## Tennis-Specific Features

1. **Set Scores Display**: Shows individual set results in a structured format
2. **Tennis Statistics**: Relevant tennis metrics instead of football stats
3. **Winners Chart**: Uses winners count for the doughnut chart visualization
4. **Set Score Input**: Allows detailed entry of game scores for each set
5. **First Serve Percentage**: Displays as percentage string (e.g., "68%")

## Integration Notes

- The component reuses the existing POTM modal from the football implementation
- Follows the same navigation and modal patterns
- Uses the same API service structure
- Maintains consistency with the overall app design language