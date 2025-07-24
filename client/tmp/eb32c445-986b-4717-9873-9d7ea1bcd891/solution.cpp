#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int key) {
    int low = 0, high = arr.size() - 1;

    while(low <= high) {
        int mid = low + (high - low) / 2;

        if(arr[mid] == key) {
            return mid;
        } else if (arr[mid] < key) {
            low = mid;
        } else {
            high = mid - 1;
        }
    }

    return -1;
}

int main() {
    int n; 
    cin >> n;
    vector<int> arr(n);

    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    int key; 
    cin >> key;
    
    cout << binarySearch(arr, key);

    return 0;
}
