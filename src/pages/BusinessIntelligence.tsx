import React, { useMemo } from 'react';
import { getAllPlatformData, getAllUserDataArray } from '../utils/dataReader';
export default function BusinessIntelligence() {
  const platformData = useMemo(() => getAllPlatformData(), []);
  const allUserData = useMemo(() => getAllUserDataArray(platformData), [platformData]);

  // Filter users who have business plan data
  const usersWithPlans = useMemo(() => {
    return allUserData.filter(user => user.businessPlanAnswers);
  }, [allUserData]);

  const usersWithCompletedPlans = useMemo(() => {
    return usersWithPlans.filter(user => user.planCompleted);
  }, [usersWithPlans]);

  // Calculate completion rate
  const completionRate = useMemo(() => {
    if (allUserData.length === 0) return 0;
    return (usersWithCompletedPlans.length / allUserData.length) * 100;
  }, [usersWithCompletedPlans.length, allUserData.length]);

  // Industry distribution
  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    usersWithPlans.forEach(user => {
      const industry = user.businessPlanAnswers?.industry as string | undefined;
      if (industry) {
        counts[industry] = (counts[industry] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);
  }, [usersWithPlans]);

  const mostCommonIndustry = industryData.length > 0 ? industryData[0].industry : 'N/A';

  // Business stage distribution
  const stageData = useMemo(() => {
    const counts: Record<string, number> = {
      idea: 0,
      startup: 0,
      growth: 0,
      established: 0,
    };
    usersWithPlans.forEach(user => {
      const stage = user.businessPlanAnswers?.business_stage as string | undefined;
      if (stage && stage in counts) {
        counts[stage]++;
      }
    });
    return counts;
  }, [usersWithPlans]);

  const mostCommonStage = useMemo(() => {
    const entries = Object.entries(stageData);
    if (entries.length === 0) return 'N/A';
    const max = entries.reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    );
    return max[0].charAt(0).toUpperCase() + max[0].slice(1);
  }, [stageData]);

  // Challenges aggregation
  const challengesData = useMemo(() => {
    const counts: Record<string, number> = {};
    usersWithPlans.forEach(user => {
      const challenges = user.businessPlanAnswers?.main_challenges as string | string[] | undefined;
      if (challenges) {
        if (Array.isArray(challenges)) {
          challenges.forEach(challenge => {
            counts[challenge] = (counts[challenge] || 0) + 1;
          });
        } else if (typeof challenges === 'string') {
          counts[challenges] = (counts[challenges] || 0) + 1;
        }
      }
    });
    return Object.entries(counts)
      .map(([challenge, count]) => ({ challenge, count }))
      .sort((a, b) => b.count - a.count);
  }, [usersWithPlans]);

  // Revenue model distribution
  const revenueModelData = useMemo(() => {
    const counts: Record<string, number> = {};
    usersWithPlans.forEach(user => {
      const model = user.businessPlanAnswers?.revenue_model as string | undefined;
      if (model) {
        counts[model] = (counts[model] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count);
  }, [usersWithPlans]);

  // Team size distribution
  const teamSizeData = useMemo(() => {
    const counts: Record<string, number> = {};
    usersWithPlans.forEach(user => {
      const size = user.businessPlanAnswers?.team_size as string | undefined;
      if (size) {
        counts[size] = (counts[size] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => {
        // Sort by numeric value if possible
        const aNum = parseInt(a.size);
        const bNum = parseInt(b.size);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return a.size.localeCompare(b.size);
      });
  }, [usersWithPlans]);

  // Helper function to get max count for bar chart scaling
  const getMaxCount = (data: { count: number }[]) => {
    return Math.max(...data.map(d => d.count), 1);
  };

  if (usersWithPlans.length === 0) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h1>Business Intelligence</h1>
          <p className="page-description">Insights from all business plans across the platform</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No Business Plans Yet</h3>
          <p>Business intelligence data will appear here once users complete their business plans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Business Intelligence</h1>
        <p className="page-description">Insights from all business plans across the platform</p>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Plans Completed</div>
          <div className="stat-value">{usersWithCompletedPlans.length}</div>
          <div className="stat-detail">out of {allUserData.length} users</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{completionRate.toFixed(1)}%</div>
          <div className="stat-detail">of all users</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Most Common Industry</div>
          <div className="stat-value">{mostCommonIndustry}</div>
          <div className="stat-detail">{industryData.length > 0 ? `${industryData[0].count} businesses` : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Most Common Stage</div>
          <div className="stat-value">{mostCommonStage}</div>
          <div className="stat-detail">{stageData[mostCommonStage.toLowerCase()] || 0} businesses</div>
        </div>
      </div>

      {/* Industry Distribution */}
      {industryData.length > 0 && (
        <div className="admin-card">
          <h2>Industry Distribution</h2>
          <div className="bar-chart">
            {industryData.map((item, index) => {
              const maxCount = getMaxCount(industryData);
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.industry} className="bar-row">
                  <div className="bar-label">{item.industry}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(210, 70%, ${60 - index * 5}%)`
                      }}
                    />
                  </div>
                  <div className="bar-value">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Business Stage Breakdown */}
      <div className="admin-card">
        <h2>Business Stage Breakdown</h2>
        <div className="stage-grid">
          <div className="stage-card stage-idea">
            <div className="stage-icon">💡</div>
            <div className="stage-name">Idea</div>
            <div className="stage-count">{stageData.idea}</div>
            <div className="stage-percentage">
              {usersWithPlans.length > 0
                ? ((stageData.idea / usersWithPlans.length) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="stage-card stage-startup">
            <div className="stage-icon">🚀</div>
            <div className="stage-name">Startup</div>
            <div className="stage-count">{stageData.startup}</div>
            <div className="stage-percentage">
              {usersWithPlans.length > 0
                ? ((stageData.startup / usersWithPlans.length) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="stage-card stage-growth">
            <div className="stage-icon">📈</div>
            <div className="stage-name">Growth</div>
            <div className="stage-count">{stageData.growth}</div>
            <div className="stage-percentage">
              {usersWithPlans.length > 0
                ? ((stageData.growth / usersWithPlans.length) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="stage-card stage-established">
            <div className="stage-icon">🏢</div>
            <div className="stage-name">Established</div>
            <div className="stage-count">{stageData.established}</div>
            <div className="stage-percentage">
              {usersWithPlans.length > 0
                ? ((stageData.established / usersWithPlans.length) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Common Challenges */}
      {challengesData.length > 0 && (
        <div className="admin-card">
          <h2>Common Challenges</h2>
          <div className="challenges-grid">
            {challengesData.map(item => (
              <div key={item.challenge} className="challenge-badge">
                <span className="challenge-text">{item.challenge}</span>
                <span className="challenge-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Model Distribution */}
      {revenueModelData.length > 0 && (
        <div className="admin-card">
          <h2>Revenue Model Distribution</h2>
          <div className="bar-chart">
            {revenueModelData.map((item, index) => {
              const maxCount = getMaxCount(revenueModelData);
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.model} className="bar-row">
                  <div className="bar-label">{item.model}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(200, 70%, ${55 - index * 5}%)`
                      }}
                    />
                  </div>
                  <div className="bar-value">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Size Distribution */}
      {teamSizeData.length > 0 && (
        <div className="admin-card">
          <h2>Team Size Distribution</h2>
          <div className="bar-chart">
            {teamSizeData.map((item, index) => {
              const maxCount = getMaxCount(teamSizeData);
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.size} className="bar-row">
                  <div className="bar-label">{item.size}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(190, 70%, ${60 - index * 5}%)`
                      }}
                    />
                  </div>
                  <div className="bar-value">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
