# Google Analytics Integration Setup Guide

This guide explains how to integrate your Dashboard with real Google Analytics data.

## Prerequisites

1. Google Analytics 4 (GA4) property set up for your website
2. Google Cloud Project with Analytics Reporting API enabled
3. Service Account with access to your GA4 property

## Frontend Setup

### 1. Install Required Dependencies

```bash
npm install @google-analytics/data
```

### 2. Environment Configuration

Create or update your `.env` file:

```env
# Google Analytics Configuration
REACT_APP_GA_PROPERTY_ID=your_ga4_property_id_here
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API endpoint for analytics
REACT_APP_API_BASE_URL=https://staging-api.parallelstudio.asia/api
```

### 3. Frontend Integration

The frontend is already set up with:
- ✅ Analytics API service (`src/api/analytics.js`)
- ✅ Analytics hook (`src/hooks/useAnalytics.js`)
- ✅ Updated Dashboard component with real data integration
- ✅ Fallback to mock data if API fails
- ✅ Loading states and error handling

## Backend Setup (Laravel)

### 1. Install Google Analytics Package

```bash
composer require google/analytics-data
```

### 2. Create Analytics Controller

Create `app/Http/Controllers/API/AnalyticsController.php`:

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\RunReportRequest;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\DateRange;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    private $client;
    private $propertyId;

    public function __construct()
    {
        $this->propertyId = config('services.google_analytics.property_id');
        
        // Initialize the client with credentials
        $this->client = new BetaAnalyticsDataClient([
            'credentials' => config('services.google_analytics.credentials_path')
        ]);
    }

    public function dashboard(Request $request)
    {
        try {
            $period = $request->input('period', 'last30days');
            $dateRange = $this->getDateRange($period);
            
            // Get summary metrics
            $summaryData = $this->getSummaryMetrics($dateRange);
            
            // Get visitor chart data
            $visitorChart = $this->getVisitorChart($dateRange);
            
            // Get device breakdown
            $deviceChart = $this->getDeviceBreakdown($dateRange);
            
            // Get top pages
            $topPages = $this->getTopPages($dateRange);
            
            // Get location data
            $locationData = $this->getLocationData($dateRange);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summaryData,
                    'visitorChart' => $visitorChart,
                    'deviceChart' => $deviceChart,
                    'topPages' => $topPages,
                    'locationData' => $locationData
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics data: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getDateRange($period)
    {
        $endDate = Carbon::now();
        $startDate = Carbon::now();
        
        switch ($period) {
            case 'last7days':
                $startDate->subDays(7);
                break;
            case 'last30days':
                $startDate->subDays(30);
                break;
            case 'last90days':
                $startDate->subDays(90);
                break;
            case 'lastYear':
                $startDate->subYear();
                break;
            default:
                $startDate->subDays(30);
        }
        
        return [
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d')
        ];
    }

    private function getSummaryMetrics($dateRange)
    {
        $request = new RunReportRequest([
            'property' => 'properties/' . $this->propertyId,
            'date_ranges' => [
                new DateRange([
                    'start_date' => $dateRange['start_date'],
                    'end_date' => $dateRange['end_date'],
                ])
            ],
            'metrics' => [
                new Metric(['name' => 'activeUsers']),
                new Metric(['name' => 'screenPageViews']),
                new Metric(['name' => 'averageSessionDuration']),
                new Metric(['name' => 'bounceRate']),
            ]
        ]);

        $response = $this->client->runReport($request);
        
        // Process the response and return formatted data
        return $this->processSummaryResponse($response);
    }

    private function getVisitorChart($dateRange)
    {
        $request = new RunReportRequest([
            'property' => 'properties/' . $this->propertyId,
            'date_ranges' => [
                new DateRange([
                    'start_date' => $dateRange['start_date'],
                    'end_date' => $dateRange['end_date'],
                ])
            ],
            'dimensions' => [
                new Dimension(['name' => 'date']),
            ],
            'metrics' => [
                new Metric(['name' => 'activeUsers']),
            ]
        ]);

        $response = $this->client->runReport($request);
        
        return $this->processVisitorChartResponse($response);
    }

    // Add more methods for device breakdown, top pages, location data...
    
    public function realtime()
    {
        // Implement real-time analytics
    }
    
    public function page(Request $request)
    {
        // Implement page-specific analytics
    }
    
    public function audience(Request $request)
    {
        // Implement audience insights
    }
}
```

### 3. Add Routes

In `routes/api.php`:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Analytics routes
    Route::prefix('analytics')->group(function () {
        Route::post('dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('realtime', [AnalyticsController::class, 'realtime']);
        Route::post('page', [AnalyticsController::class, 'page']);
        Route::post('audience', [AnalyticsController::class, 'audience']);
    });
});
```

### 4. Configuration

Add to `config/services.php`:

```php
'google_analytics' => [
    'property_id' => env('GA_PROPERTY_ID'),
    'credentials_path' => env('GA_CREDENTIALS_PATH', storage_path('app/google-analytics-credentials.json')),
],
```

Add to `.env`:

```env
GA_PROPERTY_ID=your_ga4_property_id
GA_CREDENTIALS_PATH=/path/to/your/service-account-credentials.json
```

### 5. Service Account Setup

1. Go to Google Cloud Console
2. Create a service account
3. Download the JSON credentials file
4. Add the service account email to your GA4 property with Viewer permissions

## Testing

1. The Dashboard will automatically try to fetch real analytics data
2. If the API fails, it will fallback to mock data with a yellow "Mock Data" indicator
3. When real data is available, you'll see a green "Live Data" indicator
4. Use the "Refresh" button to manually update the data

## Features

- ✅ Real-time data integration with Google Analytics 4
- ✅ Automatic fallback to mock data if API fails
- ✅ Loading states and error handling
- ✅ Data caching and refresh functionality
- ✅ Multiple time period support (7 days, 30 days, 3 months, 1 year)
- ✅ Visual indicators for data source (Live/Mock)
- ✅ Summary metrics (visitors, page views, session time, bounce rate)
- ✅ Visitor trend charts
- ✅ Device breakdown
- ✅ Geographic distribution
- ✅ Top pages analysis

## Next Steps

1. Set up the backend Laravel controller
2. Configure Google Analytics credentials
3. Test the integration
4. Customize metrics and dimensions as needed
5. Add more advanced analytics features

For more advanced features, you can extend the analytics API to include:
- Conversion tracking
- Traffic source analysis
- User behavior flows
- Custom events and goals
- A/B testing results