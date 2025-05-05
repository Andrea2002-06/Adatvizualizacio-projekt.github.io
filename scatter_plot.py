import pandas as pd
import altair as alt
import streamlit as st

# Load the CSV data
@st.cache_data
def load_data():
    url = 'https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/refs/heads/main/europai_lakhatasi_adatbazis.csv'
    df = pd.read_csv(url)
    return df

# Initialize Streamlit app
def main():
    st.set_page_config(page_title="European Housing Database", layout="centered")
    st.title("European Income and Rent Scatter Plot")

    df = load_data()

    # Sidebar filters
    st.sidebar.header("Filters")
    
    years = sorted(df['Év'].dropna().unique())
    selected_year = st.sidebar.selectbox("Select Year", ["All Years"] + years)

    age_groups = sorted(df['Korosztály'].dropna().unique())
    selected_age_group = st.sidebar.selectbox("Select Age Group", ["All Age Groups"] + age_groups)

    # Filter data
    filtered_df = df.copy()
    if selected_year != "All Years":
        filtered_df = filtered_df[filtered_df['Év'] == selected_year]
    if selected_age_group != "All Age Groups":
        filtered_df = filtered_df[filtered_df['Korosztály'] == selected_age_group]

    # Build scatter plot
    scatter = alt.Chart(filtered_df).mark_point(
        filled=True,
        stroke='white',
        strokeWidth=0.8,
        size=80
    ).encode(
        x=alt.X('Jövedelem (€/hó):Q', 
                title='Income (€/month)',
                axis=alt.Axis(titleFontSize=14, labelFontSize=10, format=',.0f', titleColor="#122620")),
        y=alt.Y('Bérleti díj (€/hó):Q', 
                title='Rent (€/month)',
                axis=alt.Axis(titleFontSize=14, labelFontSize=10, format=',.0f', titleColor="#122620")),
        color=alt.Color('Város:N', 
                        title='City', 
                        scale=alt.Scale(
                            range=["#8b6b4b", "#a27b5c", "#c4a484", "#d4b996", "#e5d5b5"]
                        ),
                        legend=alt.Legend(titleFontSize=12, labelFontSize=10)),
        tooltip=[
            alt.Tooltip('Város:N', title='City'),
            alt.Tooltip('Jövedelem (€/hó):Q', title='Income', format=',.0f'),
            alt.Tooltip('Bérleti díj (€/hó):Q', title='Rent', format=',.0f'),
            alt.Tooltip('Korosztály:N', title='Age Group')
        ]
    ).properties(
        width=700,
        height=500,
        background="transparent"
    ).configure_axis(
        domain=False,
        grid=True,
        gridColor='#dee2e6',
        ticks=False
    ).configure_view(
        stroke=None
    )

    st.altair_chart(scatter, use_container_width=True)

if __name__ == "__main__":
    main()
