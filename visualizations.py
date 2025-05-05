import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import altair as alt
import streamlit as st

# Load the data
@st.cache_data
def load_data():
    url = "https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/refs/heads/main/europai_lakhatasi_adatbazis.csv"
    df = pd.read_csv(url)
    return df

def create_scatter_plot(df):
    # Create the scatter plot
    fig = px.scatter(
        df,
        x="Jövedelem (€/hó)",
        y="Bérleti díj (€/hó)",
        color="Város",
        title="Income vs Rent by City",
        labels={
            "Jövedelem (€/hó)": "Income (€/month)",
            "Bérleti díj (€/hó)": "Rent (€/month)",
            "Város": "City"
        },
        color_discrete_sequence=["#8b6b4b", "#a27b5c", "#c4a484", "#d4b996", "#e5d5b5"]
    )
    
    # Update layout
    fig.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(
            family="Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
            size=12,
            color="#122620"
        ),
        hovermode='closest',
        showlegend=True
    )
    
    # Update traces
    fig.update_traces(
        marker=dict(
            size=10,
            line=dict(width=0.8, color='#ffffff')
        ),
        hovertemplate="<br>".join([
            "City: %{customdata[0]}",
            "Income: %{x:,.0f} €/month",
            "Rent: %{y:,.0f} €/month",
            "Age Group: %{customdata[1]}"
        ])
    )
    
    return fig

def create_housing_heatmap(df):
    # Calculate housing cost ratio
    df['Housing Cost Ratio'] = (df['Bérleti díj (€/hó)'] / df['Jövedelem (€/hó)']) * 100
    
    # Create the heatmap
    fig = go.Figure(data=go.Heatmap(
        z=df['Housing Cost Ratio'],
        x=df['Év'],
        y=df['Város'],
        colorscale=[
            [0, '#f8f9fa'],
            [0.1, '#f5f5f5'],
            [0.2, '#e9ecef'],
            [0.3, '#d4b996'],
            [0.4, '#c4a484'],
            [0.5, '#b38b6d'],
            [0.6, '#a27b5c'],
            [0.7, '#8b6b4b'],
            [1.0, '#6c4a3c']
        ],
        reversescale=True,
        hoverongaps=False,
        hovertemplate="<br>".join([
            "City: %{y}",
            "Year: %{x}",
            "Housing Cost Ratio: %{z:.1f}%",
            "Rent: %{customdata[0]:,.0f} €/month",
            "Income: %{customdata[1]:,.0f} €/month",
            "Age Group: %{customdata[2]}",
            "Property Type: %{customdata[3]}"
        ])
    ))
    
    # Update layout
    fig.update_layout(
        title='Housing Cost Ratio by City and Year',
        xaxis_title='Year',
        yaxis_title='City',
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(
            family="Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
            size=12,
            color="#122620"
        )
    )
    
    return fig

def main():
    st.set_page_config(
        page_title="European Housing Prices Analysis",
        page_icon="🏠",
        layout="wide"
    )
    
    # Load data
    df = load_data()
    
    # Title
    st.title("European Housing Prices Analysis")
    st.subheader("From the Perspective of Generation Z")
    
    # Sidebar filters
    st.sidebar.header("Filters")
    
    # Year filter
    selected_year = st.sidebar.selectbox(
        "Select Year",
        ["All"] + sorted(df['Év'].unique().tolist())
    )
    
    # Age group filter
    selected_age_group = st.sidebar.selectbox(
        "Select Age Group",
        ["All"] + sorted(df['Korosztály'].unique().tolist())
    )
    
    # Apply filters
    if selected_year != "All":
        df = df[df['Év'] == selected_year]
    if selected_age_group != "All":
        df = df[df['Korosztály'] == selected_age_group]
    
    # Create tabs
    tab1, tab2 = st.tabs(["Income vs Rent Analysis", "Housing Cost Heatmap"])
    
    with tab1:
        st.plotly_chart(create_scatter_plot(df), use_container_width=True)
    
    with tab2:
        st.plotly_chart(create_housing_heatmap(df), use_container_width=True)

if __name__ == "__main__":
    main() 