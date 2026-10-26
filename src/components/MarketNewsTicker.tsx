import { getCurrentMarketNews } from '../game/marketEngine';
import './MarketNewsTicker.css';

interface MarketNewsTickerProps {
  day: number;
  onOpenCampaign?: () => void;
}

export function MarketNewsTicker({ day, onOpenCampaign }: MarketNewsTickerProps) {
  const news = getCurrentMarketNews(day);

  return (
    <div className="suly-news-ticker-bar">
      <div className="suly-ticker-badge">
        <span>عاجل 🔴</span>
      </div>

      <div className="suly-ticker-content">
        <strong>{news.title}</strong>
        <span> — {news.summary}</span>
      </div>

      {onOpenCampaign && (
        <button type="button" className="suly-ticker-campaign-btn" onClick={onOpenCampaign}>
          📜 خريطة القصة
        </button>
      )}
    </div>
  );
}
