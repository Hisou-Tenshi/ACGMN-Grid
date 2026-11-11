"use client";

import { useEffect, useState } from 'react';
import { error as logError } from "@/lib/logger"
import { useI18n } from '@/lib/i18n/provider';
import { GameGrid } from '../components/GameGrid';
import { GameCell } from '../types';
import { loadCellsFromDB } from '../utils/indexedDB';

export default function Home() {
  const { t, locale } = useI18n();

  const [cells, setCells] = useState<GameCell[]>(
    (t('cell_titles') as string[]).map((title, index) => ({
      id: index,
      title,
      image: undefined,
      name: undefined,
      imageObj: null,
    }))
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      // 每次切换语系都以当前语系的默认标题为基底，避免沿用上一个语系的标题
      let merged: GameCell[] = (t('cell_titles') as string[]).map((title, index) => ({
        id: index,
        title,
        image: undefined,
        name: undefined,
        imageObj: null,
      }));

      try {
        const savedCells = await loadCellsFromDB();
        // 合并 DB 数据但不覆盖标题（title 由语系字典或本地覆盖提供）
        savedCells.forEach((savedCell) => {
          const idx = merged.findIndex((cell) => cell.id === savedCell.id);
          if (idx !== -1) {
            const rest: Partial<GameCell> = { ...savedCell };
            delete rest.title;
            merged[idx] = { ...merged[idx], ...rest } as GameCell;
          }
        });

        // 应用该语系下的自定义标题覆盖
        if (typeof window !== 'undefined') {
          const key = `gameGridTitles_${locale}`;
          const json = localStorage.getItem(key);
          if (json) {
            try {
              const map: Record<string, string> = JSON.parse(json);
              merged = merged.map((c) => ({ ...c, title: map[c.id] ?? c.title }));
            } catch {}
          }
        }
      } catch (e) {
        logError('加载数据失败:', e);
      }

      if (!cancelled) {
        setCells(merged);
        setLoading(false);
      }
    };

    setLoading(true);
    loadData();

    return () => {
      cancelled = true;
    };
  }, [locale, t]);

  const handleUpdateCells = (newCells: GameCell[]) => setCells(newCells);

  return (
    <main className="min-h-screen flex flex-col items-center py-8 relative">

      {loading ? (
        <div className="w-full max-w-[1200px] px-4" aria-hidden="true">
          <div className="grid grid-cols-6 gap-2 animate-pulse">
            {Array.from({ length: 24 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] rounded bg-gray-200" />
            ))}
          </div>
        </div>
      ) : (
        <GameGrid initialCells={cells} onUpdateCells={handleUpdateCells} />
      )}

      <div className="text-sm text-gray-500 mt-1 text-center px-4">
        <div className="mb-1 leading-relaxed">
          <p className="flex items-center justify-center gap-1">
            <a className="text-blue-500 whitespace-nowrap" href="https://hisou-tenshi.github.io/">緋想天子</a>
            <span className="whitespace-nowrap">{t('footer.made_with')}</span>
          </p>
          <p className="whitespace-nowrap text-xs sm:text-sm">{t('footer.credit')}</p>
        </div>
        <p className="flex items-center justify-center">{t('footer.powered_by')}</p>
        <p className="mt-1 flex items-center justify-center gap-2">
          <a
            href="https://github.com/Hisou-Tenshi/ACGMN-Grid/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
            aria-label="GitHub Stars"
          >
            <img
              src="https://img.shields.io/github/stars/Hisou-Tenshi/ACGMN-Grid?style=social"
              alt="GitHub Stars"
              className="align-middle"
            />
          </a>
          <a
            href="https://hits.sh/github.com/Hisou-Tenshi/ACGMN-Grid/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
            aria-label="Visitors Count"
          >
            <img
              src="https://hits.sh/github.com/Hisou-Tenshi/ACGMN-Grid.svg?color=007ec6"
              alt="Visitors Count"
              className="align-middle"
            />
          </a>
        </p>
      </div>

      {/* JSON-LD: WebApplication */}
      {(() => {
        const base = 'https://acgmn-grid.vercel.app';
        const url = `${base}/${locale}`;
        const webAppLd: Record<string, unknown> & { alternateName?: string[] } = {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name:
            (typeof t('global.main_title') === 'string' && t('global.main_title')) ||
            'ACGMN+ Preference Grid',
          url,
          applicationCategory: 'EntertainmentApplication',
          operatingSystem: 'Web',
          inLanguage: locale,
          description:
            (typeof t('meta.description') === 'string' && t('meta.description')) ||
            'Create your personal ACGMN+ preference grid',
        };
        if (locale.startsWith('zh')) {
          webAppLd.alternateName = [
            'ACGMN+生涯喜好表',
            'ACGMN+生涯个人喜好表',
            'ACGMN+喜好表',
            'ACGMN+九宫格',
            'ACGMN+喜好九宫格',
          ];
        }
        const faqLd = locale === 'zh-CN'
          ? {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: '什么是ACGMN+生涯喜好表（ACGMN+喜好表）？',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text:
                      '一种用 9、16 或 24 格布局展示你对不同维度「最爱、最惊艳、最治愈」等的ACGMN+偏好，也支持自定义行列，可导出分享。',
                  },
                },
                {
                  '@type': 'Question',
                  name: '如何生成我的ACGMN+生涯喜好表？',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text:
                      '在页面中点击格子标题或名称即可编辑，支持搜索封面或拖拽图片，完成后点击生成按钮导出图片。',
                  },
                },
              ],
            }
          : null;
        return (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
            />
            {faqLd && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
              />
            )}
          </>
        );
      })()}
    </main>
  );
}
