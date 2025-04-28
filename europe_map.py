import altair as alt
from vega_datasets import data
import pandas as pd
import matplotlib.pyplot as plt
alt.renderers.enable('default')

# Load the countries topology data
countries = alt.topo_feature(data.world_110m.url, 'countries')

# Create a base map focused on Europe
europe_map = alt.Chart(countries).mark_geoshape(
    fill='lightgray',
    stroke='white'
).project(
    'mercator',
    scale=500,
    center=[15, 55]  # Centered roughly on Europe
).properties(
    width=600,
    height=400,
    title='Map of Europe'
).configure_view(
    strokeWidth=0
)

# Display the chart
europe_map.show() 