import { compilePermissions } from './authChecker';
import Me from '../types/Me';

describe('authChecker - compilePermissions', () => {
  const mockUserInfo: Me = {
    id: 'test-id',
    firstName: 'Test',
    lastName: 'Test',
    email: 'Test',
    permissions: [],
    resource: 'srn:test:test:test',
    tenantId: 0,
  };

  it('should match simple', () => {
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:list'] }, ['User:list']),
    ).toBeTruthy();
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:list', 'User:view'] }, [
        'User:list',
      ]),
    ).toBeTruthy();
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:view', 'User:list'] }, [
        'User:list',
      ]),
    ).toBeTruthy();
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:view', 'User:list'] }, [
        'User:view',
        'User:list',
      ]),
    ).toBeTruthy();
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:view', 'User:list'] }, [
        'User:list',
        'User:view',
      ]),
    ).toBeTruthy();
    expect(
      compilePermissions(
        {
          ...mockUserInfo,
          permissions: [
            'starlight:PlatformAccount:create',
            'starlight:PlatformAccount:view',
            'starlight:PlatformAccount:list',
          ],
        },
        [
          'starlight:PlatformAccount:create',
          'starlight:PlatformAccount:view',
          'starlight:PlatformAccount:list',
        ],
      ),
    ).toBeTruthy();
  });

  it('should not match simple', () => {
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:list1'] }, ['User:list']),
    ).toBeFalsy();
    expect(compilePermissions({ ...mockUserInfo, permissions: ['User:list1'] }, [])).toBeTruthy();
    expect(compilePermissions({ ...mockUserInfo, permissions: [] }, ['User:list'])).toBeFalsy();
  });

  it('should match pattern', () => {
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:*'] }, ['User:list']),
    ).toBeTruthy();
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:*', 'SuperUser:list'] }, [
        'User:list',
      ]),
    ).toBeTruthy();
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['SuperUser:list', 'User:*'] }, [
        'User:list',
      ]),
    ).toBeTruthy();
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['SuperUser:list', 'User:*'] }, [
        'User:list',
        'User:list',
      ]),
    ).toBeTruthy();
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['SuperUser:list', 'User:*'] }, [
        'SuperUser:list',
        'User:list',
      ]),
    ).toBeTruthy();
  });

  it('should not match pattern', () => {
    expect(
      compilePermissions({ ...mockUserInfo, permissions: ['User:*'] }, ['SuperUser:list']),
    ).toBeFalsy();
  });

  it('should match and produce parameters', () => {
    expect(
      compilePermissions(
        {
          ...mockUserInfo,
          permissions: [
            `User:view(resource: ${encodeURIComponent(mockUserInfo.resource as string)})`,
          ],
        },
        ['User:view'],
      ),
    ).toEqual({
      resource: mockUserInfo.resource,
    });
  });

  it('should match and produce accessToken mapped parameter', () => {
    expect(
      compilePermissions(
        {
          ...mockUserInfo,
          permissions: ['User:view(accessTokenKey: resource|serviceAccount)'],
        },
        ['User:view'],
      ),
    ).toEqual({
      serviceAccount: mockUserInfo.resource,
    });
  });
});
