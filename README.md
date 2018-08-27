# Discounted Cash Flow Analysis on a Design
This plugin downloads a design using the [Geodesignhub API](https://www.geodesignhub.com/api/), computes its area and construction costs and provides a [Discounted Cash Flow](https://en.wikipedia.org/wiki/Discounted_cash_flow) analysis to calculate Net Present Value of this design. The core idea of this plugin is to generate the data and then use Excel or other programs to do more advanced analysis. To that effect, it support numeric data that simply be copy pasted in Excel. 

### Spatial Analysis Library
In additon to showing the basic financial numbers, a spatial anlaysis library is included in this plugin. The library analyzes the location of the diagram and then generates a grid. Once the grid is generated, it allocates the costs over that grid. This is useful to visualize how money flows in the design over space. 

### Adding the plugin
The plugin can be added to your project using the Administration panel. 


## Screenshots
You can adjust the WACC to different settings for a new NPV and cash flow analysis. Generally a value between 5-15 is recommended. Consult a professional to estimate the range. 

![interface][ui]

[ui]: https://i.imgur.com/ERVGb6z.png "User Interface"

Once the WACC and the NPV has been calculated, maps are generated that show how the investemnts are distributed in the study area. The Spatial Analysis library distributes the investments over a grid. 

![Set WACC and Compute][waccandslider]

[waccandslider]: https://i.imgur.com/jkNliPI.png "Design Discounted Cash Flow Analysis"

In addition to showing the total investment, you can choose to see yearly investments and use the slider to see how over the years, your investment will be distributed. 

![alt text][yearlyortotal]

[yearlyortotal]: https://i.imgur.com/W0m4srV.png "Design Discounted Cash Flow Analysis"

While the defualt is to show the Cash flow analysis for every system, you can choose to see just specific systems e.g. Green Infrastructure and Ecology and so on. 

![alt text][filterbysystem]

[filterbysystem]: https://i.imgur.com/T5ccYlb.png "Design Discounted Cash Flow Analysis"

You can select the "Raw" to get the actual number instead of abbreviated on and then directly use it in Excel. Changing the Raw / Pretty Print button will update the tables and the values. 

![alt text][finstatement]

[finstatement]: https://i.imgur.com/zyOa2uJ.png "Design Discounted Cash Flow Analysis"


