
import './ProjectLocation.css';

export default function ProjectLocation({ project }) {
  const modelTypes = project?.modelTypes || [];

  const stats = modelTypes.flatMap((type) =>
    (type.stats || []).map((stat) => ({
      ...stat,
      modelName: type.modelName,
    }))
  );

  const categories = modelTypes.flatMap((type) =>
    (type.areaBreakdown || []).map((section) => ({
      ...section,
      modelName: type.modelName,
    }))
  );

  // Balanced specification rows.
  // Example:
  // 8 => 4 + 4
  // 7 => 4 + 3
  // 6 => 3 + 3
  // 5 => 3 + 2
  // 9 => 3 + 3 + 3
  //
  // Each row expands to fill the full available width.

  const getSpecificationRows = (items) => {
    const count = items.length;

    if (!count) return [];

    // Keep small collections in one row.
    if (count <= 4) return [items];

    // Use balanced rows with up to 4 items per row.
    const numberOfRows = Math.ceil(count / 4);
    const baseSize = Math.floor(count / numberOfRows);
    const extraItems = count % numberOfRows;

    const rows = [];
    let start = 0;

    for (let i = 0; i < numberOfRows; i++) {
      const rowSize = baseSize + (i < extraItems ? 1 : 0);

      rows.push(items.slice(start, start + rowSize));
      start += rowSize;
    }

    return rows;
  };

  const specificationRows = getSpecificationRows(stats);

  return (
    <section className="project-layout-section">
      <div className="project-layout-container">

        {/* ====================================
            MODEL SPECIFICATIONS
        ==================================== */}

        {stats.length > 0 && (
          <div className="project-specifications">

            <div className="section-heading">
              <span className="section-label">
                Overview
              </span>

              <h3>Model Specifications</h3>
            </div>

            <div className="spec-table-wrapper">
              <div className="spec-grid">

                {specificationRows.map((row, rowIndex) => (
                  <div
                    className="spec-row"
                    key={`spec-row-${rowIndex}`}
                  >
                    {row.map((stat, index) => (
                      <div
                        className="spec-item"
                        key={`${stat.modelName}-${stat.label}-${index}`}
                      >
                        <span className="spec-label">
                          {stat.label}
                        </span>

                        <span className="spec-value">
                          {stat.value}
                          {stat.unit ? ` ${stat.unit}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}

              </div>
            </div>

          </div>
        )}

        {/* ====================================
            AREA BREAKDOWN
        ==================================== */}

        <div className="area-breakdown-section">

          <div className="section-heading">
            <span className="section-label">
              Floor Plan
            </span>

            <h3>Layout &amp; Area Breakdown</h3>
          </div>

          {categories.length > 0 ? (
            <div className="area-breakdown-list">

              {categories.map((section, index) => (
                <div
                  className="area-category"
                  key={`${section.modelName}-${section.categoryName}-${index}`}
                >

                  <div className="area-category-header">

                    <h4>{section.categoryName}</h4>

                    {modelTypes.length > 1 && section.modelName && (
                      <span className="model-name">
                        {section.modelName}
                      </span>
                    )}

                  </div>

                  <div className="area-table-wrapper">
                    <table className="area-table">

                      <thead>
                        <tr>
                          <th>Space</th>
                          <th>Dimensions</th>
                          <th>Details</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(section.items || []).map((item, itemIndex) => (
                          <tr key={`${item.room}-${itemIndex}`}>

                            <td className="room-name">
                              {item.room}
                            </td>

                            <td className="room-dimensions">
                              {item.dimensions || '—'}
                            </td>

                            <td className="room-features">
                              {item.features || '—'}
                            </td>

                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>

                </div>
              ))}

            </div>
          ) : (
            <div className="layout-empty-state">
              <p>
                Detailed room measurements are not provided for this model.
                Please refer to the floor plans above.
              </p>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
