# VAT & Accounting System Guide

## Overview
The KPC system now includes a flexible VAT (Value Added Tax) system that can be enabled or disabled based on business needs, along with a complete accounting system for tracking operating expenses.

## VAT Configuration

### Settings Location
- Navigate to **Dashboard > Settings > Business Tab**
- Find the "Tax & Accounting Settings" section

### VAT Options

#### 1. VAT Disabled (Default)
- **Use Case**: When prices entered already include VAT, or business is VAT-exempt
- **Behavior**: 
  - All prices entered are treated as final prices
  - No additional VAT calculations
  - Profit calculations use the full sale amount
  - Suitable for small businesses or VAT-inclusive pricing

#### 2. VAT Enabled
- **Use Case**: When you need to add VAT on top of base prices
- **Configuration**:
  - Set VAT rate (default: 16.5% for Malawi)
  - Enter VAT registration number
- **Behavior**:
  - VAT is automatically calculated and added to sales
  - Profit calculations exclude VAT amount
  - VAT summary shown in reports
  - Suitable for VAT-registered businesses

## How It Works

### Sales Process
1. **VAT Disabled**: 
   - Enter final price → Customer pays that amount
   - Example: Enter MWK 1,000 → Customer pays MWK 1,000

2. **VAT Enabled**:
   - Enter base price → System adds VAT → Customer pays total
   - Example: Enter MWK 1,000 → System adds 16.5% VAT → Customer pays MWK 1,165

### Profit Calculations
- **VAT Disabled**: Profit = Sale Amount - Cost of Goods
- **VAT Enabled**: Profit = (Sale Amount - VAT) - Cost of Goods

### Reports & Analytics
- Profit & Loss statements show VAT breakdown when enabled
- VAT summary section displays total VAT collected
- Clear indicators show whether VAT is enabled or disabled

## Accounting System

### Operating Expenses
- **Location**: Dashboard > Expenses
- **Features**:
  - Track business operating expenses
  - Categorize expenses (Rent, Marketing, etc.)
  - Date range filtering
  - Export capabilities

### Expense Categories
- Rent & Utilities
- Marketing & Advertising
- Office Supplies
- Transportation
- Professional Services
- Insurance
- Equipment & Maintenance
- Staff Salaries
- Other

### Integration with Profit Reports
- Enable "Include Operating Expenses in Reports" in settings
- Operating expenses are automatically included in profit calculations
- Net Profit = Gross Profit - Operating Expenses

## Business Scenarios

### Scenario 1: Small Retail Shop (VAT Disabled)
- Prices on products already include any applicable taxes
- Simple profit calculation: Revenue - Cost of Goods
- No VAT registration required
- Suitable for businesses below VAT threshold

### Scenario 2: VAT-Registered Business (VAT Enabled)
- Add VAT on top of base prices
- Collect VAT for tax authorities
- Detailed VAT reporting
- Profit calculations exclude VAT

### Scenario 3: Service Business with Expenses
- Enable operating expenses tracking
- Track rent, utilities, marketing costs
- Complete profit/loss with all business expenses
- Comprehensive financial reporting

## Key Benefits

1. **Flexibility**: Choose VAT approach based on business needs
2. **Compliance**: Proper VAT calculation and reporting for registered businesses
3. **Accuracy**: Correct profit calculations whether VAT is included or excluded
4. **Completeness**: Full accounting system with expense tracking
5. **Transparency**: Clear indication of VAT status in all reports

## Migration Notes
- Existing businesses can enable/disable VAT anytime
- Historical data remains unchanged
- New sales will use current VAT settings
- Reports show VAT status for each period

## Support
For questions about VAT configuration or accounting setup, refer to your local tax authority guidelines or consult with a qualified accountant.