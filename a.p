I want to create a new features for my application named "Leads" 
I want to manage my customer throw my councilors. there are total 5 tabs. 

* There is two role to manage this leads features 
    - Admin 
    - Councilor

0. 'src/app/dashboard/leads/..': Render Only 5 div for 5 tabs.

1. 'src/app/dashboard/leads/overview' : Render summery of 
    * Summery
        - All Customers.
        - New in 30 days. 
        - Active customers. 
        - Inactive users. 

    * Overview:
        - Funnels
        - Customers
        - Councilors
        - My Customers 

    * Counselor progress
        - Total Assign customers. 
        - Todays councilling last 24 Hours.
        - Total inactive customers. 

    * Customer growth: display as month and graph. 
    * Business facts: display as month and graph. 
    * Customer distribution: display as month and graph.  
    * Customer by funnels: display as month and graph.  

2. 'src/app/dashboard/leads/funnels' : 
    - I want to add funnel and  each funnel have [name, position, description, action(active, inactive) ]
    - add CURD opearation for each funnel and make sure position is unique and I can change position.
    - Bulk select option for delete and update status.

3. 'src/app/dashboard/leads/customers' : 
    - I want to add customer and each customer have [Name, Mobile, Email, Funnel(select form funnels), status(active:default, inactive), block ]
    - Only Admin can assign customer to acouncilor. and change councilor. but a councilor can take assign without permissoin admin if the customer have no assign councilor.
    - add a search bar and first it will search loades data. if not found then render a new button and search in data-base with a new button also include loading status. 
    - Add some filter like 
        * filter by funnels
        * filter by status
        * filter by assign by councilors and non-assign

    - Export Excel 
    - Import Excel 
    - Bulk select option for delete and update status.

4. 'src/app/dashboard/leads/councilors' : 
    - I want to add councilors and each customer have [Name, Mobile, Email]
    - add a search bar and first it will search loades data. if not found then render a new button and search in data-base with a new button also include loading status. 
    - Export Excel 
    - Import Excel 
    - Bulk select option for delete and update status.


5. 'src/app/dashboard/leads/my-leads' : 
    - I want to add customer and each customer have [Name, Mobile, Email, Funnel(select form funnels), status(active:default, inactive), block ] [make sure by mobile number is unique] [auto assign to me]
    - only render match customer throw assign.
    - add a search bar and first it will search loades data. if not found then render a new button and search in data-base with a new button also include loading status. 
    - Add some filter like 
        * filter by funnels
        * filter by status
        * filter by assign by councilors and non-assign
    - Export Excel 
    - Import Excel 
    - Bulk select option for delete and update status.