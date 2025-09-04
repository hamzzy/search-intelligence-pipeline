require 'rails_helper'

RSpec.describe SerpResult, type: :model do
  describe 'validations' do
    it 'requires engine' do
      result = SerpResult.new(q: 'test query', ts: Time.current)
      expect(result).not_to be_valid
      expect(result.errors[:engine]).to include("can't be blank")
    end

    it 'requires query' do
      result = SerpResult.new(engine: 'google', ts: Time.current)
      expect(result).not_to be_valid
      expect(result.errors[:q]).to include("can't be blank")
    end

    it 'requires timestamp' do
      result = SerpResult.new(engine: 'google', q: 'test query')
      expect(result).not_to be_valid
      expect(result.errors[:ts]).to include("can't be blank")
    end

    it 'is valid with all required fields' do
      result = SerpResult.new(
        engine: 'google',
        q: 'test query',
        ts: Time.current,
        organic: [],
        ads: [],
        paa: [],
        related: []
      )
      expect(result).to be_valid
    end
  end

  describe '.find_recent' do
    let!(:old_result) do
      SerpResult.create!(
        engine: 'google',
        q: 'test query',
        ts: 2.hours.ago,
        organic: []
      )
    end

    let!(:recent_result) do
      SerpResult.create!(
        engine: 'google',
        q: 'test query',
        ts: 30.minutes.ago,
        organic: []
      )
    end

    it 'finds recent results within max_age' do
      result = SerpResult.find_recent('test query', 'google', max_age: 1.hour)
      expect(result).to eq(recent_result)
    end

    it 'returns nil when no recent results found' do
      result = SerpResult.find_recent('test query', 'google', max_age: 10.minutes)
      expect(result).to be_nil
    end
  end

  describe '#fresh?' do
    it 'returns true for recent results' do
      result = SerpResult.new(ts: 30.minutes.ago)
      expect(result.fresh?).to be true
    end

    it 'returns false for old results' do
      result = SerpResult.new(ts: 2.hours.ago)
      expect(result.fresh?).to be false
    end
  end
end
